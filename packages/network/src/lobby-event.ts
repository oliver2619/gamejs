export interface LobbySessionJson {
    readonly id: string;
    readonly data: any;
    readonly open: boolean;
    readonly players: number;
}

export interface LobbyEvent {

    readonly name: string;
}

export interface LobbyEventListSessions extends LobbyEvent {

    readonly name: 'listSessions';
    readonly sessions: LobbySessionJson[];
}

export interface LobbyEventAddSession extends LobbyEvent {

    readonly name: 'addSession';
    readonly session: LobbySessionJson;
}

export interface LobbyEventRemoveSession extends LobbyEvent {

    readonly name: 'removeSession';
    readonly sessionId: string;
}

export interface LobbyEventUpdateSession extends LobbyEvent {

    readonly name: 'updateSession';
    readonly session: LobbySessionJson;
}

