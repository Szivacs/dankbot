import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class ClearQueueCommand implements Command{
    command = "clearqueue";
    aliases = ["clearq", "clearqueue", "delqueue", "deletequeue"];
    description = "Clears the queue.";

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.queue.clear();
        msg.channel.send(":notes: Playlist cleared!");
    }
}