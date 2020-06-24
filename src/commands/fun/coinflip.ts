import { Command, CommandProperties } from "../../services/commands";
import Discord from 'discord.js'

export default class CoinFlipCommand implements Command {
    command = "coinflip";
    aliases = ["coin"];
    description = "Flips a coin";

    sides = ["tails", "heads"]

    async run(msg : Discord.Message, props : CommandProperties){
        let side = this.sides[Math.floor(Math.random() * 2)];
        msg.channel.send(`It's ${side}!`);
    }
}