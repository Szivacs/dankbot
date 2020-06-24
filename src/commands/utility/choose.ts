import { Command, CommandProperties } from "../../services/commands";
import Discord from 'discord.js'

export default class ChooseCommand implements Command {
    command = "choose";
    description = "Pick a random word from the provided list";
    args = [
        {
            name: "options",
            description: "The list of words to pick from",
            optional: false,
            continous: true
        }
    ];

    async run(msg : Discord.Message, props : CommandProperties){
        let words = props.args[0].split(" ");
        msg.channel.send(`${words[Math.floor(Math.random() * words.length)]}`);
    }
}