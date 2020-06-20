import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
export default class LeaveCommand implements Command{
    command = "leave";
    aliases = ["stop"];
    description = "Leave the current voice channel";

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.leave();
    }
}