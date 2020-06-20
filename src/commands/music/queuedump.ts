import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class QueueDumpCommand implements Command{
    command = "queuedump";
    aliases = ["qdump"];
    description = "Save the current playlist as a text file";

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.sendQueueAsFile(msg);
    }
}