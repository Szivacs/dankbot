import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class JoinCommand implements Command{
    command = "join";
    aliases = ["come"];
    description = "Connect to the voice channel";
    args = [
        {
            name: "channel",
            description: "The channel to connect to",
            optional: true,
            continous: false,
            isValid: Validation.isStringUser,
            validate: Validation.getUserIdFromString
        }
    ]

    async run(msg : Discord.Message, props : CommandProperties){
        if(props.args[0] == null){
            if(msg.member.voice == null)
                return Promise.reject(new Error("The user was not in a voice channel"));
            MusicPlayer.join(msg.member.voice.channel, msg.channel as Discord.TextChannel);
        }else{
            let member = await msg.guild.members.fetch(props.args[0]);
            if(member == null || member.voice == null)
                return Promise.reject(new Error("The user was not in a voice channel"));
            MusicPlayer.join(member.voice.channel, msg.channel as Discord.TextChannel);
        }
    }
}