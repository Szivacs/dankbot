import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class AutoplayCommand implements Command{
    command = "autoplay";
    aliases = ["ap"];
    description = "Set autoplay for the current song";
    args = [
        {
            name: "state",
            description: "State of the autoplay. True or false",
            optional: true,
            continous: false,
            isValid: Validation.isBoolean,
            validate: Validation.validateBoolean
        }
    ]

    async run(msg : Discord.Message, props : CommandProperties){
        if(props.args[0] == null)
            MusicPlayer.setAutoplay(!MusicPlayer.autoplaying);
        else
            MusicPlayer.setAutoplay(props.args[0]);
    }
}