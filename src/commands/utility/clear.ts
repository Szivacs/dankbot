import { Command, CommandProperties } from "../../services/commands";
import Discord from 'discord.js'
import Validation from "../../util/validation";

export default class ClearCommand implements Command {
    command = "clear";
    aliases = ["prune", "msgdelete", "deletemsg"];
    description = "Clear a specific number of messages from the textchannel";
    args = [
        {
            name: "count",
            description: "Number of messages to be deleted. It should be between 1-100.",
            optional: false,
            continous: false,
            isValid: (x : string) => { return Validation.isNumberAndPositive(x) && parseInt(x) <= 100; },
            validate: Validation.validateNumber
        },
        {
            name: "user",
            description: "Filter for author of the message",
            optional: true,
            continous: false,
            isValid: Validation.isStringUser,
            validate: Validation.getUserIdFromString
        }
    ];

    async run(msg : Discord.Message, props : CommandProperties){
        msg.channel.lastMessage.delete().then(() => {
            let safe = props.options.has("s") || props.options.has("safe") || false;
            let deletedMessages : Discord.Snowflake[] = [];
            if(props.args[1] == null){
                msg.channel.messages.fetch({limit: props.args[0]}).then(messages => {
                    messages.forEach((m, k) => {
                        if(!safe || (safe && m.pinned == false)){
                            deletedMessages.push(m.id);
                        }
                    });
                    msg.channel.bulkDelete(deletedMessages);
                });
            }else{
                msg.channel.messages.fetch({limit: 100}).then(messages => {
                    messages.forEach((m, k) => {
                        if(m.author.id === props.args[1].substr(3, 18)){
                            if(!safe || (safe && m.pinned == false)){
                                deletedMessages.push(m.id);
                            }
                        }
                    });
                    msg.channel.bulkDelete(deletedMessages);
                });
            }
        });
    }
}