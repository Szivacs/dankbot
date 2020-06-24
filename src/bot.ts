import * as Discord from 'discord.js'
import http from 'http'
import * as fs from 'fs'
import { CommandService } from './services/commands'
import Validation from './util/validation';
import fetch from 'node-fetch'

export let dankbot : DankBot = null;

export class DankBot extends Discord.Client{

    server : http.Server;

    commands : CommandService;
    settings : {[key : string] : any}
    goingToSleep = false;
    lastHeartbeatTime : number;

    textChannels : Array<{name : string, id : string}>;

    constructor(server : http.Server, options? : Discord.ClientOptions){
        super(options);
        this.server = server;
        dankbot = this;

        console.log("Starting client");

        this.commands = new CommandService();
        this.settings = JSON.parse(fs.readFileSync("settings.json").toString());

        this.on("ready", () => {
            console.log("Client ready");
            this.user.setActivity("with a 🐌", {type: "PLAYING"});

            setInterval(async () => {
                let time = Date.now();
                if(time - this.commands.lastCommandTime < this.settings.timeBeforeSleep){
                    console.log("[HEARTBEAT] Sending signal to server...");
                    fetch("https://discorddankbot.herokuapp.com/");
                    console.log("[HEARTBEAT] Staying awake");
                }else{
                    console.log("[HEARTBEAT] Going to sleep shortly...");
                    this.user.setStatus("idle");
                    this.user.setActivity("the 🌇", { type: 'WATCHING' });
                    this.goingToSleep = true;
                }
                this.lastHeartbeatTime = Date.now();
            }, this.settings.heartbeatTimer);
            this.lastHeartbeatTime = Date.now();

            this.textChannels = new Array();
            for(let g of this.guilds.cache.array()){
                for(let channel of g.channels.cache.array()){
                    if(channel.type == "text"){
                        this.textChannels.push({name: channel.name, id: channel.id});
                    }
                }
            }
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

    async executeCommand(str : string, channelId : string) {
        let wb = await this.fetchWebhook(process.env.WHID);
        wb = await wb.edit({
            channel: channelId
        });
        wb.send(this.settings.prefixes[0]+str);
    }
}