import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService, Song } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';
import fetch from 'node-fetch'
import querystring from 'querystring'
import * as Util from '../../util/util'
import { dankbot } from '../../bot';
import stringSimilarity from 'string-similarity'

export default class MusicQuizCommand implements Command{
    command = "musicquiz";
    aliases = ["mq"];
    description = "Play a music quiz";
    args = [
        {
            name: "songs",
            description: "The number of songs [0-100], default 15",
            optional: true,
            continous: false,
            isValid: Validation.isNumberAndPositive,
            validate: Validation.validateNumber
        },
        {
            name: "threshold",
            description: "The threshold [0-100], default 75",
            optional: true,
            continous: false,
            isValid: Validation.isNumberAndPositive,
            validate: Validation.validateNumber
        }
    ];

    song : Song;
    songs : Array<Song> = new Array();
    tc : Discord.TextChannel;
    isRunning = false;
    token : string;
    startCount : number;
    count : number;
    scores : Map<string, {id : string, score : number}>;
    threshold : number;

    constructor(){
        MusicPlayer.onSongEnded.add(async (song : Song) => {
            if(song.length > 0 || song.playlist != "Music quiz") return;
            if(MusicPlayer.vc == null) return;

            let points = Array.from(this.scores.values()).sort((a, b) => b.score - a.score);
            let description = "**Leaderboard**\n\n";
            let medals = [":first_place:", ":second_place:", ":third_place:"];
            for(let i = 0; i < Math.min(3, points.length); i++){
                description += `${medals[i]} <@!${points[i].id}> - ${points[i].score} pts\n`;
            }
            if(points.length == 0){
                description += "No one scored any points...";
            }

            let embed = {
                title: `${song.title} by ${song.author}`,
                description: description,
                thumbnail: {
                    url: song.img
                },
                author: {
                    name: "It was"
                },
                footer: {
                    text: `Song ${this.count} / ${this.startCount}`
                }
            };

            this.tc.send("", {embed});

            if(this.count >= this.startCount){
                this.isRunning = false;
                MusicPlayer.continue();
                return;
            }

            this.nextSong();
        });

        dankbot.on("message", (msg : Discord.Message) => {
            if(msg.author.bot || this.isRunning == false || this.song == null || MusicPlayer.playing == false || msg.channel != this.tc) return;

            let sAll = stringSimilarity.compareTwoStrings(this.preprocess(this.song.title + this.song.author), msg.content);
            if(sAll >= this.threshold){
                if(this.scores.has(msg.author.id) == false){
                    this.scores.set(msg.author.id, { id: msg.author.id, score: 0 });
                }
                this.scores.set(msg.author.id, { id: msg.author.id, score: this.scores.get(msg.author.id).score + 3 });
                msg.channel.send(`:white_check_mark: <@!${msg.author.id}> +3 points!`);
                return;
            }
            let sTitle = stringSimilarity.compareTwoStrings(this.preprocess(this.song.title), msg.content);
            let sArtist = stringSimilarity.compareTwoStrings(this.preprocess(this.song.author), msg.content);
            if(Math.max(sTitle, sArtist) > this.threshold){
                if(this.scores.has(msg.author.id) == false){
                    this.scores.set(msg.author.id, { id: msg.author.id, score: 0 });
                }
                this.scores.set(msg.author.id, { id: msg.author.id, score: this.scores.get(msg.author.id).score + 1 });
                msg.channel.send(`:white_check_mark: <@!${msg.author.id}> +1 points!`);
                return;
            }

            msg.channel.send(`:x: <@!${msg.author.id}> incorrect!`);
        });

        dankbot.on("voiceStateUpdate", (before : Discord.VoiceState, after : Discord.VoiceState) => {
            if(after.member.id == dankbot.user.id && after.channel == null){
                this.isRunning = false;
            }
        });
    }

    preprocess(str : string) : string {
        str = str.toLowerCase();
        str = str.replace(/\(.+\)/g, "");
        str = str.replace(/-.*(edit|remaster|radio|mix|version).*$/g, "");
        str = str.trim();
        return str;
    }

    async nextSong(){
        setTimeout(async () => {
            if(MusicPlayer.vc == null) return;
            this.song = this.songs.pop();
            if(this.song == null) return;
            if(this.song.src[0] == null){
                this.nextSong();
                return;
            }

            console.log(this.song);
            MusicPlayer.play(this.song);
            console.log(this.preprocess(this.song.title));
            this.count++;
        }, 2000);
    }

    async run(msg : Discord.Message, props : CommandProperties){
        if(this.isRunning)
            return;

        let res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            body: querystring.stringify({
                grant_type: "client_credentials"
            }),
            headers: {
                "Authorization": `Basic ${process.env.SAPI}`,
                "Content-Type": "application/x-www-form-urlencoded",
            }
        });
        this.token = (await res.json()).access_token;
        
        if(this.token == null){
            msg.channel.send(":notes: Something went wrong");
            return;
        }

        let offset = Math.floor(Math.random() * 1864);
        res = await fetch(`https://api.spotify.com/v1/playlists/6QAKnenuZoowNqxRzZbeRg/tracks?offset=${offset}&limit=100`, {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });

        let items = (await res.json()).items;
        
        if(items == null){
            msg.channel.send(":notes: Something went wrong");
            return;
        }

        this.songs.splice(0, this.songs.length);
        for(let item of items){
            this.songs.push({
                title: item.track.name,
                author: item.track.artists[0].name,
                playlist: "Music quiz",
                src: [item.track.preview_url],
                img: item.track.album == null ? null : item.track.album.images[0].url,
                offset: 0,
                length: 0
            });
        }
        this.songs = Util.shuffle(this.songs);
        this.count = 0;
        this.startCount = props.args[0] || 15;
        this.isRunning = true;
        this.tc = msg.channel as Discord.TextChannel;

        if(!(props.options.has("n") || props.options.has("nojoin"))){
            if(msg.member.voice == null)
                return Promise.reject(new Error("The user was not in a voice channel"));
            await MusicPlayer.join(msg.member.voice.channel, msg.channel as Discord.TextChannel);
        }
        MusicPlayer.interrupt();

        this.scores = new Map();
        this.threshold = 0.75;
        if(props.args[1])
            this.threshold = props.args[0] / 100;

        this.nextSong();
    }
}