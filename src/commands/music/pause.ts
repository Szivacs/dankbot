import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class PauseCommand implements Command{
    command = "pause";
    description = "Pause the current song";

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.pause();
    }
}