import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class PlayCommand implements Command{
    command = "play";
    aliases = ["add"];
    description = "Play music, or add to queue";
    args = [
        {
            name: "query|url",
            description: "Search query, youtube video or playlist, mp3 url",
            optional: false,
            continous: true
        }
    ]

    async run(msg : Discord.Message, props : CommandProperties){
        if(!(props.options.has("n") || props.options.has("nojoin"))){
            if(msg.member.voice == null)
                return Promise.reject(new Error("The user was not in a voice channel"));
            await MusicPlayer.join(msg.member.voice.channel, msg.channel as Discord.TextChannel);
        }
        MusicPlayer.request(props.args[0]);
    }
}