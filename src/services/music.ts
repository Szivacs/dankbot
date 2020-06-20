import Discord from 'discord.js'
import Queue from '../util/queue'
import Validation from '../util/validation';
import ytdl from 'ytdl-core'
import Delegate from '../util/delegate';
import { dankbot } from '../bot'
import Format from '../util/format';
import * as fs from 'fs'

const ytsr = require('ytsr');

export interface Song{
    title : string;
    author : string;
    playlist : string;
    src : Array<string>;
    img : string;
    offset : number;
    length : number;
}

export class MusicService {
    static async getSongFromYoutube(url : string) : Promise<Song> {
        try{
            console.log(`[MUSIC] Loading song info for '${url}'`);
            let info = await ytdl.getBasicInfo(url);
            console.log(`[MUSIC] Found info for '${url}'`);
            return Promise.resolve({
                title: (info.media.song == null) ? info.title : info.media.song,
                author: (info.media.artist == null) ? info.author.name : info.media.artist,
                playlist: null,
                src: [url],
                img: info.thumbnail_url,
                offset: 0,
                length: parseInt(info.length_seconds)
            });
        }catch(e){
            return Promise.reject(e);
        }
    }

    static async search(query : string) : Promise<Song> {
        try{
            console.log(`[MUSIC] Searching for '${query}'`);
            let filters = await ytsr.getFilters(query);
            let filter = filters.get('Type').find((o : any) => o.name === 'Video');
            let info = await ytsr(null, {limit: 3, nextpageRef: filter.ref});

            if(info.items.length == 0)
                return Promise.reject(new Error("No results found"));
            
            let links = info.items.map((x : any) => x.link);
            if(links.length == 0)
                return Promise.reject(new Error("No sources found"));

            console.log(`[MUSIC] Found song for '${query}'`);
            return Promise.resolve({
                title: info.items[0].title,
                author: info.items[0].author.name,
                playlist: null,
                src: links,
                img: info.items[0].thumbnail,
                offset: 0,
                length: Validation.getSecondsFromHHMMSS(info.items[0].duration)
            });
        }catch(e){
            return Promise.reject(e);
        }
    }

    static async updateSong(song : Song) : Promise<void> {
        try{
            console.log(`[MUSIC] Updating song info for '${song.src[0]}'`);
            let info = await ytdl.getBasicInfo(song.src[0]);
            console.log(`[MUSIC] Found info for '${song.src[0]}'`);
            song.title = (info.media.song == null) ? info.title : info.media.song;
            song.author = (info.media.artist == null) ? info.author.name : info.media.artist;
            return Promise.resolve();
        }catch(e){
            return Promise.reject(e);
        }
    }
}

export class MusicPlayer {

    static conn : Discord.VoiceConnection;
    static vc : Discord.VoiceChannel;
    static tc : Discord.TextChannel;

    static recentSongs : Array<Song>;
    static queue : Queue<Song>;
    static savedQueue : Queue<Song>;
    static playing = false;
    static looping = false;
    static currentSong : Song;
    static stream : Discord.StreamDispatcher;

    static onSongStarted = new Delegate();
    static onSongEnded = new Delegate();
    static onError = new Delegate();

    static async join(vc : Discord.VoiceChannel, tc : Discord.TextChannel) : Promise<void> {
        if(vc == null)
            return Promise.reject(new Error("Attempting to join a null voice channel"));

        if(this.vc == vc)
            return Promise.resolve();

        try{
            this.conn = await vc.join();
            this.vc = vc;
            this.tc = tc;
            this.queue = new Queue();
            this.savedQueue = new Queue();
            this.recentSongs = new Array();
            this.currentSong = null;
            this.playing = false;
            this.looping = false;
            console.log(`[MUSIC] Connected to voice channel <${vc.name}:${vc.id}>`);
            return Promise.resolve();
        }catch(e){
            return Promise.reject(e);
        }
    }
    static async leave() : Promise<void> {
        if(this.vc == null)
            return Promise.reject(new Error("Attempting to leave a null voice channel"));
        
        console.log(`[MUSIC] Disconnected from voice channel <${this.vc.name}:${this.vc.id}>`);
        this.stop();
        this.playing = false;
        this.looping = false;
        this.stream.destroy();
        this.queue.clear();
        this.recentSongs.splice(0, this.recentSongs.length);
        this.currentSong = null;
        this.vc.leave();
        this.vc = null;
        this.tc = null;
        this.stream = null;
    }

    static queueSongs(songs : Array<Song>) {
        for(let song of songs){
            this.queue.push(song);
        }

        if(this.playing){
            if(songs.length == 1)
                this.tc.send(`:notes: ${songs[0].title} added to the queue.`);
            else
                this.tc.send(`:notes: Playlist ${songs[0].playlist} loaded`);
        }else{
            this.next();
        }
    }
    static async request(str : string){
        if(this.vc == null)
            return Promise.reject(new Error("Attempting to request in a null voice channel"));
        console.log(`[MUSIC] Requesting '${str}' in <${this.vc.name}:${this.vc.id}>`);

        let songs = new Array();
        if(Validation.isStringURL(str)){
            if(ytdl.validateURL(str)){
                let song = await MusicService.getSongFromYoutube(str);
                songs.push(song);
            }
        }else{
            let song = await MusicService.search(str);
            MusicService.updateSong(song);
            songs.push(song);
        }

        if(songs.length > 0)
            this.queueSongs(songs);
    }

    static play(song : Song) {
        if(this.playing)
            this.stop();

        if(ytdl.validateURL(song.src[0]))
            this.stream = this.conn.play(ytdl(song.src[0], {quality: "highestaudio", filter: "audioonly"}), {volume: 0.5, seek: song.offset});
        else
            this.stream = this.conn.play(song.src[0], {volume: 0.5, seek: song.offset});

        song.offset = 0;

        this.stream.on("start", () => {
            this.playing = true;
            this.onSongStarted.invoke(song);
        });
        this.stream.on("finish", () => {
            this.next();
            this.onSongEnded.invoke(song);
        });
        this.stream.on("error", (err) => {
            this.playing = false;
            console.error(err);
            this.onError.invoke(err);
            if(song.src.length > 1){
                song.src.shift();
                this.queue.pushFront(song);
            }
        });

        console.log(`[MUSIC] Playing '${song.title}' from '${song.src[0]}'`);
        dankbot.user.setActivity(song.author + " " + song.title, { type: 'PLAYING' });
        if(song.length > 0)
            this.printSong(song, this.tc);
    }
    static playInterrupted(song : Song) {
        if(this.currentSong != null){
            this.currentSong.offset = this.getTime();
            this.queue.pushFront(this.currentSong);
        }
        this.queue.pushFront(song);
        this.looping = false;
        if(this.playing)
            this.stop();
        else
            this.next();
    }
    static next() {
        this.stop();
        this.playing = false;

        if(this.looping == false){
            this.currentSong = this.queue.pop();
            if(this.currentSong != null && this.currentSong.length != 0 && this.currentSong.offset == 0)
                this.recentSongs.push(this.currentSong);
        }

        if(this.currentSong != null){
            this.play(this.currentSong);
        }
    }
    static skip(count : number) {
        let len = this.queue.length;
        let nr = 1;
        for(let i = 0; i < Math.min(count-1, len); i++){
            this.queue.pop();
            nr++;
        }

        if(nr == 1)
            this.tc.send(":notes: Song skipped.");
        else
            this.tc.send(`:notes: Skipped ${nr} songs.`);
        console.log(`[MUSIC] ${nr} songs skipped`);

        this.next();
    }
    static pause(){
        if(this.playing == null) return;
        this.stream.pause();
        this.tc.send(":notes: Song paused.");
    }
    static resume(){
        if(this.playing == null) return;
        this.stream.resume();
        this.tc.send(":notes: Song resumed.");
    }
    static setLoop(state : boolean = true){
        if(state){
            this.looping = true;
            this.tc.send(":notes: Looping enabled");
        }else{
            this.looping = false;
            this.tc.send(":notes: Looping disabled");
        }
    }
    static seek(seconds : number){
        this.currentSong.offset = seconds;
        this.queue.pushFront(this.currentSong);
        this.next();
    }
    static interrupt() {
        if(this.currentSong != null){
            this.currentSong.offset = this.getTime();
            this.queue.pushFront(this.currentSong);
        }
        this.savedQueue = this.queue.copy();
        this.looping = false;
        this.queue.clear();
        this.stop();
    }
    static continue() {
        this.queue = this.savedQueue.copy();
        this.savedQueue.clear();
        this.next();
    }
    static stop() {
        if(this.playing == false) return;
        if(this.stream != null)
            this.stream.end();
        dankbot.user.setActivity("with a 🐌", {type: "PLAYING"});
    }

    static getTime() : number {
        if(this.playing == false) return 0;
        return (this.stream.streamTime / 1000) + this.currentSong.offset;
    }

    static printSong(song : Song, tc : Discord.TextChannel) {
        if(song == null){
            tc.send(":notes: No songs are playing right now...");
            return;
        }

        let embed = {
            title: `:notes: ${song.title}`,
            url: song.src[0][0] == "." ? "" : song.src[0],
            thumbnail: {
                url: song.img
            },
            color: "#479de8",
            fields: [
                {
                    name: "Artists",
                    value: song.author,
                    inline: true
                }
            ],
            author: {
                name: "Now playling",
                url: "",
                icon_url: ""
            }
        };

        if(song.length != 0){
            embed.fields.push({
                name: "Length",
                value: Format.secondsToHHMMSS(song.length),
                inline: true
            });
        }

        if(song.playlist != null){
            embed.fields.push({
                name: "Playlist",
                value: song.playlist,
                inline: true
            });
        }

        tc.send("", {
            embed: embed
        });
    }

    static sendQueueAsFile(msg : Discord.Message) {
        let str = `Queue dumped by ${msg.author.username} as ${(new Date()).toUTCString()}\n\nRecently played:\n`;
        for(let song of this.recentSongs){
            str += `${song.title} - ${song.src[0]}\n`;
        }
        str += "\nUp next:\n";
        for(let song of this.queue.data){
            str += `${song.title} - ${song.src[0]}\n`;
        }
        fs.writeFile("./.temp/queue.txt", str, (err) => {
            if(err){
                console.error(err);
                return;
            }
            msg.channel.send("", {
                files: ["./.temp/queue.txt"]
            });
        });
    }
}