import Discord from 'discord.js'
import Queue from '../util/queue'
import Validation from '../util/validation';
import ytdl from 'ytdl-core'
import Delegate from '../util/delegate';
import { dankbot } from '../bot'
import Format from '../util/format';
import * as fs from 'fs'
import Diagnostics from '../util/diagnostics'
import * as Util from '../util/util'

const ytsr = require('ytsr');
const ytpl = require('ytpl');

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
    static async getSongInfo(url : string) : Promise<Song> {
        try{
            Diagnostics.begin("music:get");
            console.log(`[MUSIC] Loading song info for '${url}'`);
            let info = await ytdl.getBasicInfo(url);
            console.log(`[MUSIC] Found info for '${url}'`);
            Diagnostics.end();
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
            Diagnostics.begin("music:search");
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
            Diagnostics.end();
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

    static async updateSongInfo(song : Song) : Promise<void> {
        try{
            Diagnostics.begin("music:update");
            console.log(`[MUSIC] Updating song info for '${song.src[0]}'`);
            let info = await ytdl.getBasicInfo(song.src[0]);
            console.log(`[MUSIC] Found info for '${song.src[0]}'`);
            song.title = (info.media.song == null) ? info.title : info.media.song;
            song.author = (info.media.artist == null) ? info.author.name : info.media.artist;
            Diagnostics.end();
            return Promise.resolve();
        }catch(e){
            return Promise.reject(e);
        }
    }

    static async getSongsFromPlaylist(url : string) : Promise<Array<Song>> {
        try{
            Diagnostics.begin("music:playlist");
            console.log(`[MUSIC] Loading playlist from '${url}'`);
            let info = await ytpl(url, {limit: Infinity});
            console.log(`[MUSIC] Songs loaded from '${url}'`);
            let songs : Array<Song> = new Array();
            for(let item of info.items){
                songs.push({
                    title: item.title,
                    author: item.author.name,
                    playlist: info.title,
                    src: [item.url_simple],
                    img: item.thumbnail,
                    offset: 0,
                    length: Validation.getSecondsFromHHMMSS(item.duration)
                });
            }
            Diagnostics.end();
            return Promise.resolve(songs);
        }catch(e){
            return Promise.reject(e);
        }
    }

    static async getRelatedSongs(song : Song) : Promise<Array<Song>> {
        try{
            Diagnostics.begin("music:autoplay");
            console.log(`[MUSIC] Loading related songs to '${song.src[0]}'`);
            let info = await ytdl.getInfo(song.src[0]);
            console.log(`[MUSIC] Loaded related songs to '${song.src[0]}'`);
            let songs : Array<Song> = new Array();
            for(let item of info.related_videos){
                songs.push({
                    title: item.title,
                    author: item.author,
                    playlist: `Related to ${song.title}`,
                    src: [`https://youtu.be/${item.id}`],
                    //@ts-ignore
                    img: item.video_thumbnail,
                    offset: 0,
                    length: parseInt(item.length_seconds)
                });
            }
            songs = Util.shuffle(songs);
            Diagnostics.end();
            return Promise.resolve(songs);
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
    static autoplaying = false;
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
            this.autoplaying = false;
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
        if(this.stream != null)
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
            if(ytpl.validateURL(str)){
                songs = await MusicService.getSongsFromPlaylist(str);
            }
            else if(ytdl.validateURL(str)){
                let song = await MusicService.getSongInfo(str);
                songs.push(song);
            }
        }else{
            let song = await MusicService.search(str);
            MusicService.updateSongInfo(song);
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
            this.next();
        });

        console.log(`[MUSIC] Playing '${song.title}' from '${song.src[0]}'`);
        dankbot.user.setActivity(`${song.title} by ${song.author}`, { type: 'PLAYING' });
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
        if(this.playing)
            this.stop();
        this.playing = false;

        if(this.looping == false){
            this.currentSong = this.queue.pop();
            if(this.currentSong != null && this.currentSong.length != 0 && this.currentSong.offset == 0){
                this.recentSongs.push(this.currentSong);

                if(this.autoplaying && this.queue.length == 0){
                    MusicService.getRelatedSongs(this.currentSong).then((songs) => this.queue.pushArray(songs));
                }
            }
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

        if(this.playing)
            this.stop();
        else
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
        if(this.tc == null) return;
        if(state){
            this.looping = true;
            this.tc.send(":notes: Looping enabled");
        }else{
            this.looping = false;
            this.tc.send(":notes: Looping disabled");
        }
    }
    static setAutoplay(state : boolean = true){
        if(this.tc == null) return;
        if(state){
            this.autoplaying = true;
            this.tc.send(":notes: Autoplay enabled");

            if(this.currentSong != null && this.currentSong.length > 0 && this.queue.length == 0){
                MusicService.getRelatedSongs(this.currentSong).then((songs) => this.queue.pushArray(songs));
            }
        }else{
            this.autoplaying = false;
            this.tc.send(":notes: Autoplay disabled");
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
                name: "Now playling"
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
                inline: false
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

    static async printQueue(page : number = 1){
        if(this.playing == false || this.currentSong == null || this.tc == null) return;

        let embed = this.getQueueEmbed(page-1);
        
        let msg = await this.tc.send("", { embed });
        await msg.react('◀');
        await msg.react('▶');
        const filter = (reaction : Discord.MessageReaction, user : Discord.User) => {
            return user.bot == false;
        };
        let rc = msg.createReactionCollector(filter);
        rc.on("collect", async (r) => {
            let maxPages = Math.ceil(this.queue.length / 10);
            if(r.emoji.name == '◀') page--;
            if(r.emoji.name == '▶') page++;
            if(page > maxPages) page = 1;
            if(page < 1) page = maxPages;
            embed = this.getQueueEmbed(page-1);
            await msg.edit("", { embed });
            msg.reactions.removeAll();
            await msg.react('◀');
            await msg.react('▶');
        });
    }

    static getQueueEmbed(page : number = 1) : Discord.MessageEmbed {
        let embed = {
            title: `:notes: ${this.currentSong.title}`,
            description: `${this.currentSong.author} • ${Format.secondsToHHMMSS(this.currentSong.length)}\n\n**Next up:**`,
            url: this.currentSong.src[0],
            color: 4693480,
            author: {
                name: "Now playing"
            },
            footer: {
                text: ""
            }
        };
        if(this.queue.length == 0){
            embed.description += "\nThere are no songs in the queue right now.";
        }else{
            let totalSeconds = this.currentSong.length;
            if(page * 10 >= this.queue.length) page = 0;
            for(let i = page * 10; i < Math.min(page * 10 + 10, this.queue.length); i++){
                let song = this.queue.data[i];
                if(song.length == 0 || song.offset > 0) continue;
                embed.description += `\n:notes: **${song.title}** • ${song.author} • ${Format.secondsToHHMMSS(song.length)}`;
                totalSeconds += song.length;
            }
            if(this.queue.length > page * 10 + 10)
                embed.description += `\n\nThere are ${this.queue.length-(page * 10 + 10)} more songs in the playlist.`;

            if(totalSeconds > 0)
                embed.footer.text = `${this.queue.length+1} songs • ${Format.secondsToxhxmxs(totalSeconds)}` + ((this.queue.length / 10 > 1) ? ` • ${page+1}/${Math.ceil(this.queue.length / 10)}`: ``);
        }
        return new Discord.MessageEmbed(embed);
    }
}