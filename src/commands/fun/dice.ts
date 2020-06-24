import { Command, CommandProperties } from "../../services/commands";
import Discord from 'discord.js'
import Validation from "../../util/validation";

export default class DiceCommand implements Command {
    command = "dice";
    aliases = ["rolldice"];
    description = "Rolls dice";
    args = [
        {
            name: "count",
            description: "The number of dice. Default 1",
            optional: true,
            continous: false,
            isValid: Validation.isNumberAndPositive,
            validate: Validation.validateNumber
        },
        {
            name: "sides",
            description: "The number of sides the die has. Default 6",
            optional: true,
            continous: false,
            isValid: Validation.isNumberAndPositive,
            validate: Validation.validateNumber
        }
    ];

    async run(msg : Discord.Message, props : CommandProperties){
        let str = "";
        for(let i = 0; i < (props.args[0] || 1); i++){
            let x = Math.floor(Math.random() * (props.args[1] || 6)) + 1;
            str += `:game_die: ${x}\n`;
        }
        msg.channel.send(str);
    }
}