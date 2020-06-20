import { Command, CommandProperties } from "../../services/commands";
import Format from '../../util/format'
import Discord from "discord.js";

export default class UpdateTimeCommand implements Command {
    command = "uptime";
    description = "Print the time of operation";

    start : number;
    constructor(){
        this.start = new Date().getTime();
    }

    async run (msg : Discord.Message, props : CommandProperties){
        let duration = (new Date().getTime()) - this.start;
        msg.channel.send(`:clock4: ${Format.secondsToxhxmxs(Math.floor(duration / 1000))}`);
    }
}