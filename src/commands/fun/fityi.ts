import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService } from '../../services/music'
import Discord from 'discord.js';
import { dankbot } from '../../bot'
import * as fs from 'fs';
import { exec } from 'child_process';
import { stdout } from 'process';

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

    sounds : {[key : string] : string} = {};

    constructor() {
        dankbot.on("message", (msg : Discord.Message) => {
            if((msg.channel as Discord.TextChannel).name == "fityieffects"){
                msg.attachments.each((attachment : Discord.MessageAttachment) => {
                    console.log(`[FITYI] Downloading sound effect from '${attachment.url}'`);
                    let file = attachment.url.match(/\/([^\/]+)$/)[1];
                    if(file == null){
                        console.log("[FITYI] Could not get file name");
                        msg.channel.send("<:fityi2:415547937523892234> Could not get file name...");
                        return;
                    }
                    file = file.replace(/\..+$/, "");
                    exec(`ffmpeg -i ${attachment.url} -filter:a "volume=5.0" ./assets/sfx/fityi/${file}.mp3`, (err, stdout, stderr) => {
                        if(err){
                            console.error(err);
                            return;
                        }
                        console.log(`[FITYI] Download complete`);
                        msg.channel.send(`<:fityi2:415547937523892234> Sound effect added with the name ${file}`);
                        this.sounds[file] = "./assets/sfx/fityi/" + file + ".mp3";
                    });
                });
            }
        });

        for(let file of fs.readdirSync("./assets/sfx/fityi/")){
            let name = file.replace(/\..+$/, "");
            this.sounds[name] = "./assets/sfx/fityi/" + file;
        }
    }

    async run(msg : Discord.Message, props : CommandProperties){

        if(props.args[0] == "list"){
            let str = ":loud_sound: Available sound effects: \n";
            for(let name in this.sounds){
                str += `${name}, `;
            }
            msg.channel.send(str.substring(0, str.length-2), {split: true});
            return;
        }

        let sfx = null;
        if(props.args[0] == null){
            let values = Object.values(this.sounds);
            sfx = values[Math.floor(Math.random() * values.length)];
        }else{
            sfx = this.sounds[props.args[0]];
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