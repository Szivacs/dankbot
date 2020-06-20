export default class Format {
    static secondsToHHMMSS(seconds : number) : string {
        let h = 0;
        let m = Math.floor(seconds / 60);
        if(m >= 60){
            h = Math.floor(m / 60);
            m = m - (h * 60);
        }
        let s = seconds - (m * 60);
    
        if(h > 0) return `${h}:${("0" + m).slice(-2)}:${("0" + s).slice(-2)}`;
        else return `${m}:${("0" + s).slice(-2)}`;
    }
    static secondsToxhxmxs(seconds : number) : string {
        let h = 0;
        let m = Math.floor(seconds / 60);
        if(m >= 60){
            h = Math.floor(m / 60);
            m = m - (h * 60);
        }
        let s = seconds - (m * 60);
    
        if(h > 0) return `${h}h ${m}m ${s}s`;
        else{
            if(m > 0) return `${m}m ${s}s`;
            else return `${s}s`;
        }
    }

    static capitalize(str : string) : string {
        return str[0].toUpperCase() + str.substring(1, str.length);
    }
}