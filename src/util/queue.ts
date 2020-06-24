import { thomsonCrossSectionDependencies } from "mathjs";

export default class Queue<T>{
    data : Array<T>;
    length : number;

    constructor(){
        this.data = [];
        this.length = 0;
    }

    push(value : T){
        this.data.push(value);
        this.length++;
    }
    pushArray(arr : Array<T>){
        this.data = this.data.concat(arr);
        this.length += arr.length;
    }

    pop() : T{
        if(this.length > 0)
            this.length--;
        return this.data.shift();
    }

    peek() : T{
        return this.data[0];
    }

    pushFront(value : T){
        this.length++;
        this.data.unshift(value);
    }

    clear(){
        this.data.splice(0, this.data.length);
        this.length = 0;
    }

    copy() : Queue<T> {
        let q : Queue<T> = new Queue();
        q.data = this.data.slice();
        q.length = this.length;
        return q;
    }
}