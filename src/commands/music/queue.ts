import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class QueueCommand implements Command{
    command = "queue";
    aliases = ["playlist"];
    description = "Display the current playlist";
    args = [
        {
            name: "page",
            description: "The page index of the queue",
            optional: true,
            continous: false,
            isValid: Validation.isNumberAndPositive,
            validate: Validation.validateNumber
        }
    ];

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.printQueue(props.args[0] || 1);
    }
}