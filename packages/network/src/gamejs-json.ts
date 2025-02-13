export interface GamejsSessionEvent {
    
    readonly name: string;
}

export interface GamejsEventUpdateSessionData extends GamejsSessionEvent {

    readonly name: 'updateSessionData';
    readonly data: any;
    readonly open: boolean;
}

export interface GamejsEventAddPlayer extends GamejsSessionEvent {

    readonly name: 'addPlayer';
    readonly player: string;
}

export interface GamejsEventRemovePlayer extends GamejsSessionEvent {

    readonly name: 'removePlayer';
    readonly player: string;
}

export interface GamejsEventCustom extends GamejsSessionEvent {

    readonly name: 'custom';
    readonly data: any;
}
