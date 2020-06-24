import { Command, CommandProperties } from "../../services/commands";
import Discord from 'discord.js'
import { dankbot } from "../../bot";
import Format from '../../util/format'
import { DiagnosticsData } from '../../util/diagnostics'
import Diagnostics from '../../util/diagnostics'

export default class StatsCommand implements Command {
    command = "stats";
    aliases = ["stat", "statistics"];
    description = "Displays statistics about the bot";

    async run(msg : Discord.Message, props : CommandProperties){
        let diag = "";
        Diagnostics.operations.forEach((data, operation) => {
            diag += `${operation}: ${Math.floor(data.totalTime / data.count)} ms\n`;
        });
        msg.channel.send("", {
            embed: {
                title: "DankBot",
                description: "Discord DankBot\nhttps://discorddankbot.herokuapp.com/",
                url: "https://discorddankbot.herokuapp.com/",
                fields: [
                    {
                        name: "Uptime",
                        value: Format.secondsToxhxmxs(Math.floor(dankbot.uptime / 1000))
                    },
                    {
                        name: "Time since last heartbeat",
                        value: Format.secondsToxhxmxs(Math.floor((Date.now() - dankbot.lastHeartbeatTime) / 1000))
                    },
                    {
                        name: "Time since last command",
                        value: Format.secondsToxhxmxs(Math.floor((Date.now() - dankbot.commands.lastCommandTime) / 1000))
                    },
                    {
                        name: "Ping",
                        value: `${Date.now() - msg.createdTimestamp} ms`
                    },
                    {
                        name: "Diagnostics",
                        value: `${diag.length == 0 ? "No recorded diagnostics yet." : diag}`
                    }
                ],
                author: {
                    name: "Statistics"
                },
                footer: {
                    text: "made by szivacs",
                    icon_url: "https://cdn.discordapp.com/avatars/287221265507418112/649dd26c41e150741072037d444f7585.png?size=128"
                },
                thumbnail: {
                    url: "https://cdn.discordapp.com/avatars/637878307215638561/8aa8a2019247ed1bd1f84d0c2db59b01.png?size=128"
                }
            }
        });
    }
}