import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class SkipCommand implements Command{
    command = "skip";
    aliases = ["next"];
    description = "Skip the current song and play the next one in the queue";
    args = [
        {
            name: "count",
            description: "Number of songs to skip. Default is 1",
            optional: true,
            continous: false,
            isValid: Validation.isNumberAndPositive,
            validate: Validation.validateNumber
        }
    ]

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.skip(props.args[0]);
    }
}