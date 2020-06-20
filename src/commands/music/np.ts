import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class NpCommand implements Command{
    command = "np";
    aliases = ["nowplaying"];
    description = "Display current song";

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.printSong(MusicPlayer.currentSong, msg.channel as Discord.TextChannel);
    }
}