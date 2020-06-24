import { Command, CommandProperties } from "../../services/commands";
import Discord from 'discord.js'
import { evaluate } from 'mathjs'

export default class CalcCommand implements Command {
    command = "calc";
    aliases = ["eval", "evaluate"];
    description = "Calculates things";
    args = [
        {
            name: "expr",
            description: "The expression",
            optional: false,
            continous: true
        }
    ];

    async run(msg : Discord.Message, props : CommandProperties){
        try{
            msg.channel.send(`${evaluate(props.args[0])}`);
        }catch(e){
            msg.channel.send(`${e}`);
        }
    }
}