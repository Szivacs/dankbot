import { Command, CommandProperties } from "../../services/commands";
import Discord from 'discord.js'
import Validation from "../../util/validation";

export default class RandomCommand implements Command {
    command = "random";
    aliases = ["rand"];
    description = "Pick a random number between two numbers inclusive";
    args = [
        {
            name: "min",
            description: "The lowest number",
            optional: false,
            continous: false,
            isValid: Validation.isNumber,
            validate: Validation.validateNumber
        },
        {
            name: "max",
            description: "The highest number",
            optional: false,
            continous: false,
            isValid: Validation.isNumber,
            validate: Validation.validateNumber
        }
    ];

    async run(msg : Discord.Message, props : CommandProperties){
        msg.channel.send(`${Math.floor(Math.random() * (props.args[1] + 1 - props.args[0])) + props.args[0]}`);
    }
}