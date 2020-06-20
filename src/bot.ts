import * as Discord from 'discord.js'
import * as fs from 'fs'
import { CommandService } from './services/commands'
import Validation from './util/validation';

export let dankbot : DankBot = null;

export class DankBot extends Discord.Client{

    commands : CommandService;
    settings : {[key : string] : any}

    constructor(options? : Discord.ClientOptions){
        super(options);
        dankbot = this;

        console.log("Starting client");

        this.commands = new CommandService();
        this.settings = JSON.parse(fs.readFileSync("settings.json").toString());

        this.on("ready", () => {
            console.log("Client ready");
            this.user.setActivity("with a 🐌", {type: "PLAYING"});
        });

        this.on("message", (msg : Discord.Message) => {
            for(let prefix of this.settings.prefixes){
                if(msg.content.startsWith(prefix) || msg.mentions.has((this.user as Discord.ClientUser))){
                    this.commands.handleMessage(msg, msg.content.replace(new RegExp("(<@!\\d*>)|(" + Validation.escapeRegex(prefix) + ")"), "").trim());
                    break;
                }
            }
        });

        this.login(process.env.DAPI);
        process.on("SIGINT", () => {
            this.destroy();
            process.exit();
        });
    }
}