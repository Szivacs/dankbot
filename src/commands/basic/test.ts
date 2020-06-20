import {Command, CommandArgument, CommandProperties} from '../../services/commands'
import Discord from 'discord.js';
import Validation from '../../util/validation';
export default class HelloCommand implements Command{
    command = "test";
    aliases : string[] = [];
    description = "Test command for validation";
    category = "basic";
    args = [
        {
            name: "user",
            description: "Mention of a user to join to",
            optional: false,
            continous: false,
            isValid: Validation.isStringUser,
            validate: Validation.getUserIdFromString
        },
        {
            name: "word",
            description: "A string",
            optional: false,
            continous: false
        },
        {
            name: "number",
            description: "A number",
            optional: false,
            continous: false,
            isValid: Validation.isNumber,
            validate: Validation.validateNumber
        },
        {
            name: "opt",
            description: "An optional word",
            optional: true,
            continous: false
        },
        {
            name: "sentence",
            description: "A sentence",
            optional: true,
            continous: true
        }
    ];

    async run(msg : Discord.Message, props : CommandProperties){
        msg.channel.send("It worked :clap:");
        console.log(props);
    }
}