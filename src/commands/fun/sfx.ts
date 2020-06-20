import { Command, CommandArgument, CommandProperties } from '../../services/commands'
import { MusicPlayer, MusicService } from '../../services/music'
import Discord from 'discord.js';
import Validation from '../../util/validation';

export default class SfxCommand implements Command{
    command = "sfx";
    aliases = ["soundeffect", "se"];
    description = "Play sound effect";
    args = [
        {
            name: "name",
            description: "The name of the sound effect. Type list to display all",
            optional: true,
            continous: false,
        }
    ];

    sounds : {[key : string] : string} = {
        airhorn:"https://www.myinstants.com/media/sounds/air-horn-club-sample_1.mp3",
        airhorn2:"https://www.myinstants.com/media/sounds/dj-airhorn-sound-effect-kingbeatz_1.mp3",
        alia:"https://www.myinstants.com/media/sounds/ali-a-intro-bass-boosted.mp3",
        anotherone:"https://www.myinstants.com/media/sounds/another-one_1.mp3",
        awwman:"https://www.myinstants.com/media/sounds/creeper-oh-man.mp3",
        badumtss:"https://www.myinstants.com/media/sounds/badumtss.swf.mp3",
        barrelroll:"https://www.myinstants.com/media/sounds/barrelroll.swf.mp3",
        batman:"https://www.myinstants.com/media/sounds/im-batman.mp3",
        bitchwtf:"https://www.myinstants.com/media/sounds/55463983741159354957959692288_35100067f45.mp3",
        boomhs:"https://www.myinstants.com/media/sounds/boomheadshot.swf.mp3",
        borat:"https://www.myinstants.com/media/sounds/its-a-very-nice.mp3",
        bradberry:"https://www.myinstants.com/media/sounds/im-ethan-bradberry-greenscreen.mp3",
        bruh:"https://www.myinstants.com/media/sounds/movie_1.mp3",
        buildawall:"https://www.myinstants.com/media/sounds/i_will_build_a_great_great_wall_on_our_southern_bo.mp3",
        bullyme:"https://www.myinstants.com/media/sounds/why-you-bully-me-every-line.mp3",
        buzzer:"https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3",
        cartman:"https://www.myinstants.com/media/sounds/eric-cartman-oh-yeah-well-screw-you-guys-im-going-home.mp3",
        censor:"https://www.myinstants.com/media/sounds/censor-beep-1.mp3",
        choosenone:"https://www.myinstants.com/media/sounds/you-were-the-chosen-one.mp3",
        classicscream:"https://www.myinstants.com/media/sounds/wilhelmscream.mp3",
        combo:"https://www.myinstants.com/media/sounds/combobreaker.mp3",
        creeperhis:"https://www.myinstants.com/media/sounds/creeper.mp3",
        crickets:"https://www.myinstants.com/media/sounds/crickets.swf.mp3",
        curb:"https://www.myinstants.com/media/sounds/curb-your-enthusiasm.mp3",
        darkness:"https://www.myinstants.com/media/sounds/hellodarknessmyoldfriend.mp3",
        deeznuts:"https://www.myinstants.com/media/sounds/deez-nuts-got-eem-original-vine-mp3cut.mp3",
        dejavu:"https://www.myinstants.com/media/sounds/deja-vu.mp3",
        detected:"https://www.myinstants.com/media/sounds/tindeck_1.mp3",
        discord:"https://www.myinstants.com/media/sounds/discord-notification.mp3",
        discordcall:"https://www.myinstants.com/media/sounds/discord-call-sound.mp3",
        doit:"https://www.myinstants.com/media/sounds/senator-palpatine-do-it_1.mp3",
        dolphincensor:"https://www.myinstants.com/media/sounds/spongebob-dolphin-censor.mp3",
        dramatic:"https://www.myinstants.com/media/sounds/dramatic.swf.mp3",
        drumroll:"https://www.myinstants.com/media/sounds/drumroll.swf.mp3",
        dundun:"https://www.myinstants.com/media/sounds/dun_dun_1.mp3",
        eagames:"https://www.myinstants.com/media/sounds/ea_games.mp3",
        earrape:"https://www.myinstants.com/media/sounds/haaaaaaaaaaaaaaaaaaaaaaa.mp3",
        enemyspot:"https://www.myinstants.com/media/sounds/counter-strike-jingle-cs-radio-enemy-spotted.mp3",
        evilaugh:"https://www.myinstants.com/media/sounds/evillaugh.swf.mp3",
        fap:"https://www.myinstants.com/media/sounds/savage-fap.mp3",
        fatality:"https://www.myinstants.com/media/sounds/fatality.swf.mp3",
        fbi:"https://www.myinstants.com/media/sounds/fbi-open-up-sfx.mp3",
        finishim:"https://www.myinstants.com/media/sounds/finishhim.swf.mp3",
        fnaf:"https://www.myinstants.com/media/sounds/five-nights-at-freddys-full-scream-sound_2.mp3",
        fortnitedance:"https://www.myinstants.com/media/sounds/fortnite-funky-dance-earrape.mp3",
        fuckedup:"https://www.myinstants.com/media/sounds/it-was-at-this-moment-that-he-he-knew-he-f-cked-up.mp3",
        fuckoff:"https://www.myinstants.com/media/sounds/fuckoff.mp3",
        fusrodah:"https://www.myinstants.com/media/sounds/fus-ro-dah.mp3",
        gamecube:"https://www.myinstants.com/media/sounds/gamecube_intro.mp3",
        goodbadugly:"https://www.myinstants.com/media/sounds/goodbadugly-whistle-long.mp3",
        gotcha:"https://www.myinstants.com/media/sounds/dave-chappelle-gotcha-bitch-original-scene.mp3",
        hagay:"https://www.myinstants.com/media/sounds/ha-gay.mp3",
        haha:"https://www.myinstants.com/media/sounds/the-simpsons-nelsons-haha.mp3",
        hallelujah:"https://www.myinstants.com/media/sounds/hallelujahshort.swf.mp3",
        halo:"https://www.myinstants.com/media/sounds/Halo.mp3",
        heheboi:"https://www.myinstants.com/media/sounds/ainsley_harriott_and_his_spicy_meatconverttoaudio.mp3",
        hitmarker:"https://www.myinstants.com/media/sounds/hitmarker_2.mp3",
        howcould:"https://www.myinstants.com/media/sounds/how.mp3",
        idea:"https://www.myinstants.com/media/sounds/ding-sound-effect_2.mp3",
        illuminati:"https://www.myinstants.com/media/sounds/x-files-theme-song-copy.mp3",
        imout:"https://www.myinstants.com/media/sounds/fuck-this-shit-im-out.mp3",
        inception:"https://www.myinstants.com/media/sounds/inceptionbutton.mp3",
        incorrect:"https://www.myinstants.com/media/sounds/wrong.swf.mp3",
        jeff:"https://www.myinstants.com/media/sounds/ringtone_20.mp3",
        johncena:"https://www.myinstants.com/media/sounds/and-his-name-is-john-cena-1.mp3",
        justdoit:"https://www.myinstants.com/media/sounds/shia-labeouf-delivers-the-most-intense-motivational-speech-of-all-time_1.mp3",
        kamehameha:"https://www.myinstants.com/media/sounds/kamehameha.swf.mp3",
        konodioda:"https://www.myinstants.com/media/sounds/kono-dio-da99.mp3",
        leeroy:"https://www.myinstants.com/media/sounds/leroy.swf.mp3",
        lemmesmash:"https://www.myinstants.com/media/sounds/lemme-smash.mp3",
        lightsaber:"https://www.myinstants.com/media/sounds/lightsaber_02.mp3",
        lying:"https://www.myinstants.com/media/sounds/why-you-always-lying-original.mp3",
        mario:"https://www.myinstants.com/media/sounds/its-me-mario.mp3",
        mariotheme:"https://www.myinstants.com/media/sounds/untitled_3.mp3",
        mchurt:"https://www.myinstants.com/media/sounds/classic_hurt.mp3",
        megumin:"https://www.myinstants.com/media/sounds/explosion_3.mp3",
        missionfail:"https://www.myinstants.com/media/sounds/dank-meme-compilation-volume-17_cutted.mp3",
        missionpass1:"https://www.myinstants.com/media/sounds/gta-san-andreas-mission-complete-sound-hq.mp3",
        missionpass2:"https://www.myinstants.com/media/sounds/gta-vice-city-mission-complete-theme-gta-vice-city-mission-complete-theme.mp3",
        missionpass3:"https://www.myinstants.com/media/sounds/gta_3_mission.mp3",
        missionpass4:"https://www.myinstants.com/media/sounds/gta-iv-mission-passed.mp3",
        missionpass5:"https://www.myinstants.com/media/sounds/gta-sa-mission-passed-theme-ear-rape.mp3",
        mlb:"https://www.myinstants.com/media/sounds/mlb.swf.mp3",
        mlg:"https://www.myinstants.com/media/sounds/mlg-airhorn.mp3",
        mlgpwned:"https://www.myinstants.com/media/sounds/swaggityswagger.mp3",
        moan:"https://www.myinstants.com/media/sounds/ear-rape-moaning-girl-troll-sound-crappy-long-edition-loudtronix-hq.mp3",
        myman:"https://www.myinstants.com/media/sounds/my-man.mp3",
        nani:"https://www.myinstants.com/media/sounds/nani_Pmxf5n3.mp3",
        niconii:"https://www.myinstants.com/media/sounds/niconiconilovesyou-3_cutted.mp3",
        nooo:"https://www.myinstants.com/media/sounds/nooo.swf.mp3",
        nope:"https://www.myinstants.com/media/sounds/engineer_no01.mp3",
        ohnono:"https://www.myinstants.com/media/sounds/oh-no-no-no-no-laugh.mp3",
        ohwahah:"https://www.myinstants.com/media/sounds/david-oohwahahahah.mp3",
        ohyeah:"https://www.myinstants.com/media/sounds/01-oh-yeah.mp3",
        oneup:"https://www.myinstants.com/media/sounds/mario-1-up.mp3",
        oof:"https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3",
        oooh:"https://www.myinstants.com/media/sounds/reaction-video-supa-hot-fire-cheering.mp3",
        order66:"https://www.myinstants.com/media/sounds/order66.mp3",
        orgasm:"https://www.myinstants.com/media/sounds/epic.swf_1.mp3",
        osas:"https://www.myinstants.com/media/sounds/uvuvwevwevwe-onyetenyevwe-ugwemuhwem-osas-mp3cut.mp3",
        over9k:"https://www.myinstants.com/media/sounds/over9000.swf.mp3",
        pacman:"https://www.myinstants.com/media/sounds/wakawaka.swf.mp3",
        pikachu:"https://www.myinstants.com/media/sounds/pikachu-thunderbolt.mp3",
        plsno:"https://www.myinstants.com/media/sounds/no-god-please-no-noooooooooo.mp3",
        pornhub:"https://www.myinstants.com/media/sounds/pornhub-community-intro.mp3",
        ps1:"https://www.myinstants.com/media/sounds/ps_1.mp3",
        pumpedup:"https://www.myinstants.com/media/sounds/passinho-do-gstv-pumped-up-kicks.mp3",
        quack:"https://www.myinstants.com/media/sounds/quack.mp3",
        r2d2:"https://www.myinstants.com/media/sounds/r2d2.swf.mp3",
        rejoice:"https://www.myinstants.com/media/sounds/youyaku2.mp3",
        ricefields:"https://www.myinstants.com/media/sounds/ricefields.mp3",
        rumble:"https://www.myinstants.com/media/sounds/lets-get-ready-to-rumble.mp3",
        run:"https://www.myinstants.com/media/sounds/run-vine-sound-effect.mp3",
        sadtrombone1:"https://www.myinstants.com/media/sounds/the-price-is-right-losing-horn.mp3",
        sadtrombone2:"https://www.myinstants.com/media/sounds/sadtrombone.swf.mp3",
        sadviolin:"https://www.myinstants.com/media/sounds/tf_nemesis.mp3",
        sans:"https://www.myinstants.com/media/sounds/voice_sans.mp3",
        saxo:"https://www.myinstants.com/media/sounds/george-micael-wham-careless-whisper-1.mp3",
        screamingsheep:"https://www.myinstants.com/media/sounds/01-the-screaming-sheep.mp3",
        shallnotpass:"https://www.myinstants.com/media/sounds/gandalf_shallnotpass.mp3",
        shots: "https://www.myinstants.com/media/sounds/ratatata-911.mp3",
        shutup:"https://www.myinstants.com/media/sounds/shutup.swf.mp3",
        silencekillu:"https://www.myinstants.com/media/sounds/ahmed-the-dead-terrorist-silence-i-kill-you_.mp3",
        sitcom:"https://www.myinstants.com/media/sounds/sitcom-laughing-1.mp3",
        sparta:"https://www.myinstants.com/media/sounds/thisissparta.swf.mp3",
        stepbro:"https://www.myinstants.com/media/sounds/what-are-you-doing-step-bro-tik-tok-meme.mp3",
        succ:"https://www.myinstants.com/media/sounds/succ.mp3",
        suckadick:"https://www.myinstants.com/media/sounds/go-suck-a-dick-song-vine7-second-videos.mp3",
        surprisemf:"https://www.myinstants.com/media/sounds/surprise-motherfucker.mp3",
        swamp:"https://www.myinstants.com/media/sounds/what-are-you-doing-in-my-swamp-.mp3",
        theyaskyou:"https://www.myinstants.com/media/sounds/they-ask-you-how-you-are-and-you-just-have-to-say-that-youre-fine-sound-effect_IgYM1CV.mp3",
        thisdude:"https://www.myinstants.com/media/sounds/lol_33.mp3",
        thot:"https://www.myinstants.com/media/sounds/17863547_1503889549623226_3143527086958837760_n.mp3",
        thot2:"https://www.myinstants.com/media/sounds/if-she-breathes-shes-a-thot-1.mp3",
        tobecont:"https://www.myinstants.com/media/sounds/untitled_1071.mp3",
        trap:"https://www.myinstants.com/media/sounds/itsatrap.swf.mp3",
        trololo:"https://www.myinstants.com/media/sounds/trollolol.swf.mp3",
        trumpet:"https://www.myinstants.com/media/sounds/skullsound2.mp3",
        trumpwrong:"https://www.myinstants.com/media/sounds/my-movie_lu1KTdg.mp3",
        tuturu:"https://www.myinstants.com/media/sounds/tuturu_1.mp3",
        underestimatepower:"https://www.myinstants.com/media/sounds/you-underestimate-my-power.mp3",
        villager:"https://www.myinstants.com/media/sounds/minecraft-villager-sound-effect.mp3",
        virgin:"https://www.myinstants.com/media/sounds/no-dont-do-it-im-a-virgin.mp3",
        wasted:"https://www.myinstants.com/media/sounds/gta-v-death-sound-effect-102.mp3",
        weed:"https://www.myinstants.com/media/sounds/snoop-dogg-smoke-weed-everyday.mp3",
        whyareyougay:"https://www.myinstants.com/media/sounds/why-are-you-gay.mp3",
        whyareyourunning:"https://www.myinstants.com/media/sounds/why-are.mp3",
        wololo:"https://www.myinstants.com/media/sounds/sound-9.mp3",
        wow:"https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3",
        wow2:"https://www.myinstants.com/media/sounds/6_1Njp68r.mp3",
        wtfboom:"https://www.myinstants.com/media/sounds/wtf_boom.mp3",
        xfiles:"https://www.myinstants.com/media/sounds/expedientes-secretos-x-musica22.mp3",
        xperror:"https://www.myinstants.com/media/sounds/erro.mp3",
        xpstartup:"https://www.myinstants.com/media/sounds/windows-xp-startup-earrape.mp3",
        yeet:"https://www.myinstants.com/media/sounds/yeet.mp3"
    };

    async run(msg : Discord.Message, props : CommandProperties){
        if(props.args[0] == null || props.args[0] == "list"){
            let str = ":loud_sound: Available sound effects: \n";
            for(let name in this.sounds){
                str += `${name}, `;
            }
            msg.channel.send(str.substring(0, str.length-2), {split: true});
            return;
        }

        let sfx = this.sounds[props.args[0]];
        if(sfx == null){
            msg.channel.send(":interrobang: This sound effect is not in the list");
            return;
        }

        if(!(props.options.has("n") || props.options.has("nojoin"))){
            if(msg.member.voice == null)
                return Promise.reject(new Error("The user was not in a voice channel"));
            await MusicPlayer.join(msg.member.voice.channel, msg.channel as Discord.TextChannel);
        }
        MusicPlayer.playInterrupted({
            title: `Sound effect ${props.args[0]}`,
            author: "sfx",
            playlist: null,
            src: [sfx],
            img: null,
            offset: 0,
            length: 0
        });
    }
}