class EventEmitter {

    constructor() {
        this.cbs = [];
    }

    subscribe(cb) {
        this.cbs.push(cb);
    }

    emit(...props){
        this.cbs.forEach(cb => cb(...props));
    }

}