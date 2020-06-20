import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class LoopCommand implements Command{
    command = "loop";
    aliases = ["setloop"];
    description = "Set looping for the current song";
    args = [
        {
            name: "state",
            description: "State of the looping. True or false",
            optional: true,
            continous: false,
            isValid: Validation.isBoolean,
            validate: Validation.validateBoolean
        }
    ]

    async run(msg : Discord.Message, props : CommandProperties){
        if(props.args[0] == null)
            MusicPlayer.setLoop(!MusicPlayer.looping);
        else
            MusicPlayer.setLoop(props.args[0]);
    }
}