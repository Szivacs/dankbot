export interface DiagnosticsData {
    totalTime : number;
    count : number;
}

export default class Diagnostics {
    static start : number;
    static operation : string;
    static operations : Map<string, DiagnosticsData> = new Map();

    static begin(name : string){
        this.start = Date.now();
        this.operation = name;
    }

    static end(){
        let diff = Date.now() - this.start;
        console.log(`[DIAGNOSTICS] Operation "${this.operation}" took ${diff} ms`);
        let data = this.operations.get(this.operation);
        if(data == null){
            data = { totalTime: 0, count: 0 };
        }
        data.totalTime += diff;
        data.count++;
        this.operations.set(this.operation, data);        
    }
}