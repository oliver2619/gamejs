import { ObservableValue } from "../observable";
import { PromisesProgress } from "./promises-progress";

interface ProgressEvent {
    loaded: number;
    total: number;
}

export class ResourceLoader {

    private readonly baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl ?? document.baseURI;
    }

    loadBinary(url: string): Promise<Uint8Array> {
        return this.fetch(url, 'binary', result => result);
    }

    loadImage(url: string): Promise<HTMLImageElement> {
        return this.fetch(url, 'image', (result, type) => this.resultToImage(result, type)).then(img => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                img.addEventListener('load', () => resolve(img));
                img.onerror = (_event: Event | string, _source?: string, _lineno?: number, _colno?: number, error?: Error) => {
                    if (error == undefined) {
                        reject(`Failed to load image from URL ${url}.`);
                    } else {
                        reject(`Failed to load image from URL ${url} due to ${error.name}: ${error.message}`);
                    }
                }
            });
        });
    }

    loadJson<T>(url: string): Promise<T> {
        return this.fetch(url, 'JSON', result => JSON.parse(new TextDecoder().decode(result)));
    }

    loadText(url: string): Promise<string> {
        return this.fetch(url, 'text', result => new TextDecoder().decode(result));
    }

    private fetch<T>(url: string, type: string, mapper: (array: Uint8Array, type: string) => T): Promise<T> {
        const finalUrl = this.getFinalUrl(url);
        const observable = new ObservableValue<ProgressEvent>({ loaded: 0, total: 1 });
        const fetched = fetch(finalUrl, { method: 'GET' }).then(result => {
            const contentLength = result.headers.get('Content-Length');
            const total = contentLength == null ? undefined : Number.parseInt(contentLength);
            if (result.ok && result.body) {
                return this.read(result.body, loaded => {
                    if (total != undefined) {
                        observable.value = { loaded, total };
                    }
                }).then(array => mapper(array, result.type));
            } else {
                throw new Error(`Failed to fetch resource of type ${type} from URL ${finalUrl} with error status ${result.status}: ${result.statusText}.`);
            }
        });
        const ret = PromisesProgress.add(fetched);
        observable.subscribe(this, ev => ret.setProgress(ev.loaded, ev.total));
        return ret.result;
    }

    private getFinalUrl(url: string): URL {
        const finalUrl = URL.parse(url, this.baseUrl);
        if (finalUrl == null) {
            throw new RangeError(`Illegal URL ${url}${this.baseUrl}.`);
        }
        return finalUrl;
    }

    private async read(stream: ReadableStream<Uint8Array>, progressCallback: (loaded: number) => void): Promise<Uint8Array> {
        const chunks: Uint8Array[] = [];
        let loaded = 0;
        for await (const chunk of stream) {
            chunks.push(chunk);
            loaded += chunk.length;
            progressCallback(loaded);
        }
        const ret = new Uint8Array(loaded);
        let i = 0;
        chunks.forEach(it => {
            ret.set(it, i);
            i += it.length;
        });
        return ret;
    }

    private resultToImage(result: Uint8Array, type: string): HTMLImageElement {
        const img = document.createElement('img');
        const url = URL.createObjectURL(new Blob([result], { type }));
        img.addEventListener('load', () => URL.revokeObjectURL(url));
        img.src = url;
        return img;
    }
}