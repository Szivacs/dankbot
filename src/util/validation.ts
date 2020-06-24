export default class Validation{
    static escapeRegex(str : string) : string {
        return str.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&");
    }

    static isStringURL(str : string) : boolean {
        var pattern = new RegExp('^(https?:\\/\\/)?'+
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
            '((\\d{1,3}\\.){3}\\d{1,3}))'+
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
            '(\\?[;&a-z\\d%_.~+=-]*)?'+
            '(\\#[-a-z\\d_]*)?$','i');
        return pattern.test(str);
    }

    static isStringChannel(str : string) : boolean {
        return str.match(/^<#\d{18}>$/) != null;
    }
    static getChannelIdFromString(str : string) : string {
        return str.substr(2, 18);
    }
    static isStringUser(str : string) : boolean {
        return str.match(/<@!\d{18}>/) != null;
    }
    static getUserIdFromString(str : string) : string {
        return str.substr(3, 18);
    }

    static isNumber(str : string) : boolean {
        return str.match(/^[0-9]+$/g) != null;
    }
    static isNumberAndPositive(str : string) : boolean {
        let x = parseInt(str);
        return Validation.isNumber(str) && x > 0;
    }
    static validateNumber(str : string) : number {
        return parseInt(str);
    }

    static isHHMMSS(str : string) : boolean{
        return str.match(/^\d{2}:\d{2}(:\d{2})?$/) != null;
    }
    static getSecondsFromHHMMSS(str : string) : number {
        if(str == null) return 0;
        let parts = str.split(":");
        let seconds = 0;
        let multiplier = 1;
        for(let i = parts.length-1; i >= 0; i--){
            seconds += Number.parseInt(parts[i]) * multiplier;
            multiplier *= 60;
        }
        return seconds;
    }

    static isBoolean(str : string) : boolean {
        return str == "true" || str == "false";
    }
    static validateBoolean(str : string) : boolean {
        return str == "true"
    }
}