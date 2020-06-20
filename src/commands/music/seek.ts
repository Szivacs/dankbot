import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class SeekCommand implements Command{
    command = "seek";
    description = "Seek into the song to a certain point";
    args = [
        {
            name: "time",
            description: "The time where the song should be seeked. Format (HH:)MM:SS",
            optional: false,
            continous: false,
            isValid: Validation.isHHMMSS,
            validate: Validation.getSecondsFromHHMMSS
        }
    ]

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.seek(props.args[0]);
    }
}