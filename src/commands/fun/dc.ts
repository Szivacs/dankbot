import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class DcCommand implements Command{
    command = "dc";
    aliases = ["disconnect", "yeet"];
    description = "Disconnects a user from the voice channel";
    args = [
        {
            name: "user",
            description: "A mention of the user that should be disconnected",
            optional: false,
            continous: false,
            isValid: Validation.isStringUser,
            validate: Validation.getUserIdFromString
        }
    ];

    yeet = "https://www.myinstants.com/media/sounds/yeet.mp3";

    async run(msg : Discord.Message, props : CommandProperties){
        let member = await msg.guild.members.fetch(props.args[0]);
        if(member == null || member.voice == null)
            return Promise.reject(new Error("The user was not in a voice channel"));
        
        await MusicPlayer.join(member.voice.channel, msg.channel as Discord.TextChannel);
        MusicPlayer.playInterrupted({
            title: `YEEEEEEEEEEEEEET`,
            author: "sfx",
            playlist: null,
            src: [this.yeet],
            img: null,
            offset: 0,
            length: 0
        });
        setTimeout(() => {
            member.edit({
                channel: null
            });
        }, 1200);
    }
}