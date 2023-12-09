import { LobbySessionJson } from "./lobby-event";

export class GamejsSessionInfo {

    private constructor(readonly id: string, readonly data: any, readonly open: boolean, readonly players: number) { }

    static fromJson(json: LobbySessionJson): GamejsSessionInfo {
        return new GamejsSessionInfo(json.id, json.data, json.open, json.players);
    }
}