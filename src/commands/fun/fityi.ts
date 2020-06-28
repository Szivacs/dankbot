import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService } from '../../services/music'
import Discord from 'discord.js';
import { dankbot } from '../../bot'

export default class FityiCommand implements Command{
    command = "fityi";
    aliases = ["randomfityi"];
    description = "No need to explain...";
    args = [
        {
            name: "name",
            description: "The name of the sound effect. Type list to display all",
            optional: true,
            continous: false,
        }
    ];

    sounds : Map<string, string>;

    constructor() {
        this.sounds = new Map();
        dankbot.on("message", (msg : Discord.Message) => {
            if((msg.channel as Discord.TextChannel).name == "fityieffects"){
                msg.attachments.each((attachment : Discord.MessageAttachment) => {
                    let file = msg.content;
                    if(file.length == 0){
                        let filename = attachment.url.match(/\/([^\/]+)$/)[1];
                        if(filename != null)
                            file = filename.replace(/\.[^\.]+$/, "");
                    }
                    if(file == null || file.length == 0){
                        console.log(`[FITYI] Could not get file name from '${attachment.url}'`);
                        return;
                    }
                    this.sounds.set(file, attachment.url);
                    console.log(`[FITYI] Sound effect added`);
                    msg.channel.send(`<:fityi2:415547937523892234> Sound effect added with the name ${file}`);
                });
            }
        });
        this.init();
    }

    async init(){
        let fc = await dankbot.channels.fetch("696769253231296532") as Discord.TextChannel;
        let messages = await fc.messages.fetch({ limit: 50 });
        while(messages.size > 0){
            messages.forEach((msg : Discord.Message) => {
                msg.attachments.each((attachment : Discord.MessageAttachment) => {
                    let file = msg.content;
                    if(file.length == 0){
                        let filename = attachment.url.match(/\/([^\/]+)$/)[1];
                        if(filename != null)
                            file = filename.replace(/\.[^\.]+$/, "");
                    }
                    if(file == null || file.length == 0){
                        console.log(`[FITYI] Could not get file name from '${attachment.url}'`);
                        return;
                    }
                    this.sounds.set(file, attachment.url);
                });
            });
            messages = await fc.messages.fetch({ limit: 50, before: messages.last().id });
        }
        console.log(`[FITYI] Sound effects loaded.`);
        console.log(this.sounds);
    }

    async run(msg : Discord.Message, props : CommandProperties){

        if(props.args[0] == "list"){
            let str = ":loud_sound: Available sound effects:\n";
            msg.channel.send(str + Array.from(this.sounds.keys()).join(", "), {split: true});
            return;
        }

        let sfx = null;
        if(props.args[0] == null){
            let values = Object.values(this.sounds);
            sfx = values[Math.floor(Math.random() * values.length)];
        }else{
            sfx = this.sounds.get(props.args[0]);
        }
        if(sfx == null){
            msg.channel.send(":interrobang: This sound effect is not in the list");
            return;
        }

        if(!(props.options.has("n") || props.options.has("nojoin"))){
            if(msg.member.voice == null)
                return Promise.reject(new Error("The user was not in a voice channel"));
            await MusicPlayer.join(msg.member.voice.channel, msg.channel as Discord.TextChannel);
        }
        MusicPlayer.playInterrupted({
            title: `#fityieffects`,
            author: "fityi",
            playlist: null,
            src: [sfx],
            img: "https://i.imgur.com/XUD365P.png",
            offset: 0,
            length: 0
        });
    }
}