import { EventObservable } from "core";
import { GamejsSessionEvent, GamejsEventCustom, GamejsEventUpdateSessionData, GamejsEventAddPlayer, GamejsEventRemovePlayer } from "./gamejs-json";
import { WebSocketClient } from "./web-socket-client";

export class GamejsSession {

    readonly onBlobMessage = new EventObservable<Blob>();
    readonly onJsonMessage = new EventObservable<any>();
    readonly onClose = new EventObservable<void>();
    readonly onError = new EventObservable<Error>();
    readonly onUpdateSession = new EventObservable<GamejsSession>();
    readonly onAddPlayer = new EventObservable<string>();
    readonly onRemovePlayer = new EventObservable<string>();

    private _open = true;
    private _customData: any = {};
    private _players: string[] = [];

    get customData(): any {
        return this._customData;
    }

    get isOpen(): boolean {
        return this._open;
    }

    get players(): string[] {
        return this._players.slice(0);
    }

    private constructor(private readonly client: WebSocketClient) {
        client.onBlobMessage.subscribe(ev => this.onBlobMessage.produce(ev));
        client.onClose.subscribe(() => this.onClose.produce());
        client.onError.subscribe(ev => this.onError.produce(ev));
        client.onStringMessage.subscribe(ev => this._onJsonMessage(JSON.parse(ev)));
    }

    static join(hostAndPort: string, sessionId: string, username: string, reconnectTimeoutMs: number | undefined): Promise<GamejsSession> {
        return WebSocketClient.connect({
            url: `ws://${hostAndPort}/sessions/${sessionId}/${username}`,
            protocols: ['gamejs'],
            reconnectTimeoutMs
        }).then(c => new GamejsSession(c));
    }

    ifReadySendBlob(producer: () => Blob) {
        this.client.ifReady(it => it.sendBlob(producer()));
    }

    sendBlob(blob: Blob) {
        this.client.sendBlob(blob);
    }

    sendJson(data: any) {
        const ev: GamejsEventCustom = {
            name: 'custom',
            data
        };
        this.client.sendJson(ev);
    }

    updateSession(data: any, open: boolean) {
        const ev: GamejsEventUpdateSessionData = {
            name: 'updateSessionData',
            data,
            open
        };
        this.client.sendJson(ev);
    }

    private _onJsonMessage(message: GamejsSessionEvent) {
        switch (message.name) {
            case 'custom':
                this.onJsonMessage.produce((message as GamejsEventCustom).data);
                break;
            case 'updateSessionData':
                this._onUpdateSession(message as GamejsEventUpdateSessionData);
                break;
            case 'addPlayer':
                this._onAddPlayer((message as GamejsEventAddPlayer).player);
                break;
            case 'removePlayer':
                this._onRemovePlayer((message as GamejsEventRemovePlayer).player);
        }
    }

    private _onUpdateSession(ev: GamejsEventUpdateSessionData) {
        this._open = ev.open;
        this._customData = ev.data;
        this.onUpdateSession.produce(this);
    }

    private _onAddPlayer(player: string) {
        this._players.push(player);
        this.onAddPlayer.produce(player);
    }

    private _onRemovePlayer(player: string) {
        const found = this._players.indexOf(player);
        if (found >= 0) {
            this._players.splice(found, 1);
            this.onRemovePlayer.produce(player);
        }
    }
}