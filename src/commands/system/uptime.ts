import { Command, CommandProperties } from "../../services/commands";
import Format from '../../util/format'
import Discord from "discord.js";
import { dankbot } from "../../bot";

export default class UpdateTimeCommand implements Command {
    command = "uptime";
    description = "Print the time of operation";

    async run (msg : Discord.Message, props : CommandProperties){
        msg.channel.send(`:clock4: ${Format.secondsToxhxmxs(Math.floor(dankbot.uptime / 1000))}`);
    }
}