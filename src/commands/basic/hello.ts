import {Command, CommandArgument, CommandProperties} from '../../services/commands'
import Discord from 'discord.js';
export default class HelloCommand implements Command{
    command = "hello";
    aliases = ["hi"];
    description = "Basic command to check if bot is alive or not";

    async run(msg : Discord.Message, props : CommandProperties){
        msg.channel.send(`:wave: Hello ${msg.author.username}`);
    }
}