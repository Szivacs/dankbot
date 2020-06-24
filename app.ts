import express from 'express'
import http from 'http'
import { DankBot, dankbot } from './src/bot'
import dotenv from 'dotenv'
import path from 'path'
import socketio from 'socket.io'

dotenv.config();

const PORT = process.env.PORT || 5000;

let app = express();
let server = http.createServer(app);
let socket : socketio.Server;

app.set("views", path.join(__dirname, "public"));
app.set("view engine", "ejs");
app.use(express.static("public/static"));

server.listen(PORT);
server.on("listening", () => {
    console.log("Listening on " + PORT);

    new DankBot(server);
    socket = socketio.listen(server);
});

app.get("/", (req, res) => {
    res.render("index", {
        variable: "hello",
        channels: dankbot.textChannels || []
    });
});

app.get("/exec", (req, res) => {
    let cmd = req.query.cmd as string;
    let channel = req.query.channel as string;
    if(cmd.length == 0 || cmd.trim().length == 0 || channel.length == 0 && channel.trim().length == 0){
        res.status(400);
        return;
    }
    dankbot.executeCommand(cmd, channel);
    res.status(200);
});