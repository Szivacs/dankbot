import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class FwdCommand implements Command{
    command = "fwd";
    aliases = ["forward", "seekforward"];
    description = "Seek forward into the song";
    args = [
        {
            name: "time",
            description: "The relative time where the song should be seeked. Format (HH:)MM:SS.",
            optional: false,
            continous: false,
            isValid: Validation.isHHMMSS,
            validate: Validation.getSecondsFromHHMMSS
        }
    ]

    async run(msg : Discord.Message, props : CommandProperties){
        MusicPlayer.seek(MusicPlayer.getTime() + props.args[0]);
    }
}