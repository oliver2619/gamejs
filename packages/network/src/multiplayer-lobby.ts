import { EventObservable } from '@pluto/core';
import { GamejsSession } from './gamejs-session';
import { GamejsSessionInfo } from './gamejs-session-info';
import { LobbyEventAddSession, LobbyEventListSessions, LobbyEventRemoveSession, LobbyEventUpdateSession, LobbySessionJson, LobbyEvent } from './lobby-event';
import { WebSocketClient } from './web-socket-client';

export interface MultiplayerLobbyData {
    readonly hostAndPort: string;
    readonly reconnectTimeoutMs?: number;
}

export class MultiplayerLobby {

    readonly onSessionsChange = new EventObservable<GamejsSessionInfo[]>();
    readonly onClose = new EventObservable<void>();
    readonly onError = new EventObservable<Error>();

    private readonly hostAndPort: string;
    private readonly reconnectTimeoutMs: number | undefined;
    private _sessions: GamejsSessionInfo[] = [];

    get sessions(): GamejsSessionInfo[] {
        return this._sessions.slice(0);
    }

    private constructor(private readonly client: WebSocketClient, data: MultiplayerLobbyData) {
        this.hostAndPort = data.hostAndPort;
        this.reconnectTimeoutMs = data.reconnectTimeoutMs;
        client.onStringMessage.subscribe(this, message => this.onMessage(JSON.parse(message)));
        client.onClose.subscribe(this, () => this.onClose.next());
        client.onError.subscribe(this, ev => this.onError.next(ev));
    }

    static connect(data: MultiplayerLobbyData): Promise<MultiplayerLobby> {
        return WebSocketClient.connect({
            url: `ws://${data.hostAndPort}/sessions`,
            protocols: ['gamejs'],
            reconnectTimeoutMs: data.reconnectTimeoutMs
        }).then(client => new MultiplayerLobby(client, data));
    }

    close() {
        this.client.close();
    }

    createSession(data: any, username: string): Promise<GamejsSession> {
        return fetch(`http://${this.hostAndPort}/sessions`, {
            method: 'POST',
            body: data
        }).then(response => response.json())
            .then((json: LobbySessionJson) => this.joinSession(json.id, username));
    }

    joinSession(sessionId: string, username: string): Promise<GamejsSession> {
        return GamejsSession.join(this.hostAndPort, sessionId, username, this.reconnectTimeoutMs);
    }

    private onMessage(ev: LobbyEvent) {
        switch (ev.name) {
            case 'listSessions':
                this._onListSessions((ev as LobbyEventListSessions).sessions);
                break;
            case 'addSession':
                this._onAddSession((ev as LobbyEventAddSession).session);
                break;
            case 'removeSession':
                this._onRemoveSession((ev as LobbyEventRemoveSession).sessionId);
                break;
            case 'updateSession':
                this._onUpdateSession((ev as LobbyEventUpdateSession).session);
                break;
        }
    }

    private _onListSessions(ev: LobbySessionJson[]) {
        this._sessions = ev.map(it => GamejsSessionInfo.fromJson(it));
        this.onSessionsChange.next(this.sessions);
    }

    private _onAddSession(ev: LobbySessionJson) {
        this._sessions.push(GamejsSessionInfo.fromJson(ev));
        this.onSessionsChange.next(this.sessions);
    }

    private _onRemoveSession(sessionId: string) {
        const found = this._sessions.findIndex(it => it.id === sessionId);
        if (found >= 0) {
            this._sessions.splice(found, 1);
            this.onSessionsChange.next(this.sessions);
        }
    }

    private _onUpdateSession(ev: LobbySessionJson) {
        const found = this._sessions.findIndex(it => it.id === ev.id);
        if (found >= 0) {
            this._sessions.splice(found, 1, GamejsSessionInfo.fromJson(ev));
            this.onSessionsChange.next(this.sessions);
        }
    }
}