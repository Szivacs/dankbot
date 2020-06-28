import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService, Song } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';
import * as Util from '../../util/util'
import { dankbot } from '../../bot';

export default class RussianRouletteCommand implements Command{
    command = "rr";
    aliases = ["russianroulette"];
    description = "Play russian roulette in the voice channel";

    members : Array<Discord.GuildMember> = new Array();
    tc : Discord.TextChannel;
    isRunning = false;
    isMiss = false;

    constructor(){
        MusicPlayer.onSongEnded.add(async (song : Song) => {
            if(song.length > 0 || song.title != "Russion roulette") return;
            if(MusicPlayer.vc == null) return;

            if(this.isRunning){
                let name = this.members[0].displayName;
                if(this.isMiss){
                    let messages = [
                        `:gun: Huh... I guess it's **${name}**'s lucky day.`,
                        `:gun: Click, looks like my gun jammed, you live **${name}** for now`,
                        `:gun: Close call, but you'll live this time, **${name}**`,
                        `:gun: Hit or miss, guess I missed on **${name}**`
                    ];
                    this.tc.send(messages[Math.floor(Math.random() * messages.length)]);
                }else{
                    let messages = [
                        `:gun: Boom, **${name}** is dead.`,
                        `:gun: **${name}** has been obliterated.`,
                        `:gun: Guess who took the easy way out, its **${name}**`
                    ];
                    this.tc.send(messages[Math.floor(Math.random() * messages.length)]);
                    let member = this.members.shift();
                    member.edit({
                        channel: null
                    });
                }
            }

            if(this.members.length == 1){
                this.tc.send(`:gun: **${this.members[0].displayName}** won this match! :trophy:`);
                this.isRunning = false;
                MusicPlayer.continue();
                return;
            }

            setTimeout(async () => {
                if(MusicPlayer.vc == null) return;
                let miss = Math.random() * 100;
                if(miss < 33.33){
                    this.isMiss = true;
                    MusicPlayer.play({
                        title: `Russion roulette`,
                        author: "sfx",
                        playlist: null,
                        src: ["./assets/sfx/russianroulette/firemiss.mp3"],
                        img: null,
                        offset: 0,
                        length: 0
                    });
                }else{
                    this.isMiss = false;
                    MusicPlayer.play({
                        title: `Russion roulette`,
                        author: "sfx",
                        playlist: null,
                        src: ["./assets/sfx/russianroulette/fire.mp3"],
                        img: null,
                        offset: 0,
                        length: 0
                    });
                }
                this.isRunning = true;
            }, 1000);
        });

        dankbot.on("voiceStateUpdate", (before : Discord.VoiceState, after : Discord.VoiceState) => {
            if(after.member.id == dankbot.user.id && after.channel == null){
                this.isRunning = false;
            }
        });
    }

    async run(msg : Discord.Message, props : CommandProperties){
        if(this.isRunning)
            return;
        this.members.splice(0, this.members.length);
        if(!(props.options.has("n") || props.options.has("nojoin"))){
            if(msg.member.voice == null)
                return Promise.reject(new Error("The user was not in a voice channel"));
            await MusicPlayer.join(msg.member.voice.channel, msg.channel as Discord.TextChannel);
        }
        for(let member of MusicPlayer.vc.members.array()){
            if(member.user.bot) continue;
            this.members.push(member);
        }
        this.members = Util.shuffle(this.members);
        this.isMiss = false;
        this.tc = msg.channel as Discord.TextChannel;

        MusicPlayer.interrupt();
        await msg.channel.send(":gun: Russian roulette begins!");
        MusicPlayer.play({
            title: `Russion roulette`,
            author: "sfx",
            playlist: null,
            src: ["./assets/sfx/russianroulette/begin.mp3"],
            img: null,
            offset: 0,
            length: 0
        });
    }
}