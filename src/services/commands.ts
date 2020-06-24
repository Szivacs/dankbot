import Discord from 'discord.js'
import Validation from '../util/validation'
import Format from '../util/format'
import * as fs from 'fs';
import { dankbot } from '../bot';

export class CommandService{

    commands : Map<string, Command>;
    lastCommandTime : number;

    constructor(){
        this.commands = new Map();
        for(let dir of fs.readdirSync("./src/commands/")){
            for(let file of fs.readdirSync("./src/commands/"+dir+"/")){
                const cls = require("../commands/"+dir+"/"+file).default;
                let cmd = new cls();
                if(cmd.aliases == null)
                    cmd.aliases = new Array();
                if(cmd.category == null)
                    cmd.category = dir;
                if(cmd.args == null)
                    cmd.args = new Array();

                this.commands.set(cmd.command, cmd);
                for(let alias of cmd.aliases)
                    this.commands.set(alias, cmd);
            }
        }
        this.lastCommandTime = Date.now();
    }

    async handleMessage(msg : Discord.Message, content : string) {
        let props = this.parse(content);
        if(props.command == "help" || props.command == "man"){
            this.printLongUsage(msg, props.args[0]);
            return;
        }
        let command = this.commands.get(props.command);
        if(command != null){
            for(let i = 0; i < command.args.length; i++){
                let arg = command.args[i];
                if(i >= props.args.length){
                    if(!arg.optional){
                        if(command.invalid != null)
                            command.invalid(msg, `Too few arguments`);
                        msg.channel.send(`:interrobang: Invalid command: Too few arguments\nUsage: ${this.getShortUsage(command)}`);
                        return;
                    }
                    props.args.push(null);
                    continue;
                }
                if(arg.continous){
                    for(let j = i+1; j < props.args.length; j++){
                        props.args[i] += " " + props.args[j];
                    }
                    props.args.splice(i+1, props.args.length - i - 1);
                }else{
                    let valid = true;
                    if(arg.isValid != null)
                        valid = arg.isValid(props.args[i]);
                    if(valid){
                        if(arg.validate != null)
                            props.args[i] = arg.validate(props.args[i]);
                    }else{
                        if(command.invalid != null)
                            command.invalid(msg, `Argument ${i+1} (${props.args[i]}) is not valid`);
                        msg.channel.send(`:interrobang: Invalid command: Argument ${i+1} (${props.args[i]}) is not valid!`);
                        return;
                    }
                }
            }
            console.log(`[COMMAND] "${content}" requested by <@${msg.author.username}:${msg.author.id}> in <#${(msg.channel as Discord.TextChannel).name}:${msg.channel.id}>`);
            try{
                command.run(msg, props).then(() => msg.channel.stopTyping());
                this.lastCommandTime = Date.now();
                if(dankbot.goingToSleep){
                    fetch("https://discorddankbot.herokuapp.com/");
                    console.log("[HEARTBEAT] Staying awake");
                    dankbot.user.setStatus("online");
                    dankbot.user.setActivity("with a 🐌", {type: "PLAYING"});
                    dankbot.goingToSleep = false;
                }
            }catch(e){
                console.error(e);
            }
        }   
    }

    parse(str : string) : CommandProperties {
        let tokens = str.split(" ");
        let props = {
            command: tokens[0],
            options: new Map(),
            args: new Array()
        };
        for(let i = 1; i < tokens.length; i++){
            let t = tokens[i];
            if(t.startsWith("--")){
                t = t.replace(/^--/, "");
                let parts = t.split("=");
                props.options.set(parts[0], parts[1] || true);
            }else if(t.startsWith("-")){
                t = t.replace(/^-/, "");
                for(let c of t)
                    props.options.set(c, true);
            }else{
                props.args.push(t);
            }
        }

        return props;
    }

    getShortUsage(command : Command) : string {
        let str = `d!${command.command}`;
        for(let arg of command.args){
            str += ` [${arg.name}${arg.optional ? `?` : ``}${arg.continous ? `...` : ``}]`;
        }
        return str;
    }

    printLongUsage(msg : Discord.Message, cmd : string){
        let command = this.commands.get(cmd);
        if(command != null){
            let embed = {
                title: this.getShortUsage(command),
                description: command.description,
                author: {
                    name: "Usage / Manual"
                },
                fields: [
                    {
                        name: "Aliases",
                        value: `${command.aliases.length == 0 ? `None` : command.aliases.join(", ")}`,
                        inline: false
                    },
                    {
                        name: "Category",
                        value: `${Format.capitalize(command.category)}${command.args.length > 0 ? `\n\nArguments:` : ``}`,
                        inline: false
                    }
                ]
            };

            if(command.args.length > 0){
                embed.fields.push({
                    name: "Argument",
                    value: "",
                    inline: true
                },
                {
                    name: "Optional",
                    value: "",
                    inline: true
                },
                {
                    name: "Continous",
                    value: "",
                    inline: true
                });
                for(let arg of command.args){
                    embed.fields[2].value += `${arg.name}\n${arg.description}\n\n`;
                    embed.fields[3].value += `${arg.optional ? `Yes` : `No`}\n\n\n`;
                    embed.fields[4].value += `${arg.continous ? `Yes` : `No`}\n\n\n`;
                }
            }

            msg.channel.send("", {
                embed
            });

            return;
        }
    }
}

export interface CommandProperties{
    command : string;
    options : Map<string, any>;
    args : Array<any>;
}

export interface CommandArgument{
    readonly name : string;
    readonly description : string;
    readonly optional : boolean;
    readonly continous : boolean;

    isValid?(x : string) : boolean;
    validate?(x : string) : any;
}

export interface Command{
    readonly command : string;
    readonly aliases? : Array<string>;
    readonly description : string;
    readonly category? : string;
    readonly args? : Array<CommandArgument>;

    run(msg : Discord.Message, props : CommandProperties) : Promise<void>;
    invalid?(msg : Discord.Message, reason : string) : void;
}