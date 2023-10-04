import { EventObservable } from "core/src/index";

export interface WebSocketClientData {
    readonly url: string;
    readonly protocols: string[];
    readonly reconnectTimeoutMs?: number;
}

export interface WebSocketClientSend {
    sendBlob(blob: Blob | ArrayBuffer): void;
    sendJson(json: any): void;
    sendString(message: string): void;
}

export class WebSocketClient implements WebSocketClientSend {

    readonly onBlobMessage = new EventObservable<Blob>();
    readonly onStringMessage = new EventObservable<string>();
    readonly onError = new EventObservable<Error>();
    readonly onClose = new EventObservable<void>();

    private readonly reconnectTimeoutMs: number | undefined;

    private constructor(private webSocket: WebSocket, data: WebSocketClientData) {
        this.reconnectTimeoutMs = data.reconnectTimeoutMs;
        this.onConnect();
    }

    close() {
        this.webSocket.onmessage = null;
        this.webSocket.onclose = null;
        this.webSocket.close();
    }

    ifReady(callback: (s: WebSocketClientSend) => void) {
        if (this.webSocket.bufferedAmount === 0) {
            callback(this);
        }
    }

    sendBlob(blob: Blob | ArrayBuffer) {
        this.webSocket.send(blob);
    }

    sendJson(json: any) {
        this.webSocket.send(JSON.stringify(json));
    }

    sendString(message: string) {
        this.webSocket.send(message);
    }

    static connect(data: WebSocketClientData): Promise<WebSocketClient> {
        const webSocket = new WebSocket(data.url, data.protocols);
        return new Promise<WebSocketClient>((resolve, reject) => {
            webSocket.onopen = () => {
                webSocket.onopen = null;
                webSocket.onerror = null;
                resolve(new WebSocketClient(webSocket, data));
            };
            webSocket.onerror = () => {
                webSocket.onopen = null;
                webSocket.onerror = null;
                reject(`Failed to connect to ${data.url}`);
            };
        });
    }

    private _onClose(ev: CloseEvent) {
        this.webSocket.onclose = null;
        this.webSocket.onmessage = null;
        this.webSocket.onerror = null;
        if (ev.wasClean) {
            this.onClose.produce();
        } else {
            this.onError.produce(new Error(`Connection lost on WebSocket ${this.webSocket.url} reason ${ev.code} - ${ev.reason}`));
            this.onClose.produce();
            this.tryReconnect();
        }
    }

    private onConnect() {
        this.webSocket.onmessage = ev => this.onMessage(ev);
        this.webSocket.onerror = () => this.onError.produce(new Error(`Error on web socket ${this.webSocket.url} protocol ${this.webSocket.protocol} occurred`));
        this.webSocket.onclose = ev => this._onClose(ev);
    }

    private onMessage(ev: MessageEvent) {
        if (typeof ev.data === 'string') {
            this.onStringMessage.produce(ev.data);
        } else if (ev.data instanceof Blob) {
            this.onBlobMessage.produce(ev.data);
        } else {
            this.onError.produce(new Error(`Failed to process WebSocket message of type ${typeof ev.data}`));
        }
    }

    private reconnect() {
        const webSocket = new WebSocket(this.webSocket.url, [this.webSocket.protocol]);
        webSocket.onopen = () => {
            webSocket.onopen = null;
            webSocket.onerror = null;
            this.webSocket = webSocket;
            this.onConnect();
        };
        webSocket.onerror = () => {
            webSocket.onopen = null;
            webSocket.onerror = null;
            this.onError.produce(new Error(`Failed to reconnect to ${this.webSocket.url}`));
            this.tryReconnect();
        };
    }

    private tryReconnect() {
        if (this.reconnectTimeoutMs != undefined) {
            setTimeout(() => this.reconnect(), this.reconnectTimeoutMs);
        }
    }
}