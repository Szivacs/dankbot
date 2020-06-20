import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class ResumeCommand implements Command{
    command = "resume";
    description = "Resume the current song";

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.resume();
    }
}