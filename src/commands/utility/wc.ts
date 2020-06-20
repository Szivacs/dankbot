import { Command, CommandProperties } from "../../services/commands";
import Discord from 'discord.js'

export default class WordCountCommand implements Command {
    command = "wc";
    aliases = ["wordcount", "lettercount", "linecount"];
    description = "Count the number of letters, words and lines in the text\nAlso, using a 🚽 is pretty straightforward...";
    args = [
        {
            name: "text",
            description: "The input text",
            optional: false,
            continous: true
        }
    ];

    async run(msg : Discord.Message, props : CommandProperties){
        let cc = 0, wc = 0, lc = 1;
        let last = ' ';
        for(let c of props.args[0]){
            cc++;
            if(last == ' ' && c != ' ')
                wc++;
            if(c == '\n')
                lc++;
            last = c;
        }

        if(props.options.has("s") || props.options.has("short")){
            msg.channel.send(`${cc} characters, ${wc} words, ${lc} lines`);
        }else{
            msg.channel.send("", {
                embed: {
                    title: "Word count",
                    description: props.args[0],
                    fields: [
                        {
                            name: "Characters",
                            value: cc.toString(),
                            inline: true
                        },
                        {
                            name: "Words",
                            value: wc.toString(),
                            inline: true
                        },
                        {
                            name: "Lines",
                            value: lc.toString(),
                            inline: true
                        }
                    ]
                }
            });
        }
    }
}