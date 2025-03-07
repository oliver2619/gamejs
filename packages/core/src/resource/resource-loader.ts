import { PromisesProgress } from "./promises-progress";

export class ResourceLoader {

    private readonly baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl ?? '';
    }

    loadBinary(url: string): Promise<Blob> {
        const finalUrl = new URL(url, this.baseUrl);
        return PromisesProgress.add(fetch(finalUrl, { method: 'GET' }).then(result => {
            if (result.ok) {
                return result.blob();
            } else {
                throw new Error(`Failed to fetch binary resource ${finalUrl} with status ${result.status}: ${result.statusText}.`);
            }
        }));
    }

    loadJson<T>(url: string): Promise<T> {
        const finalUrl = new URL(url, this.baseUrl);
        return PromisesProgress.add(fetch(finalUrl, { method: 'GET' }).then(result => {
            if (result.ok) {
                return result.json();
            } else {
                throw new Error(`Failed to fetch JSON resource ${finalUrl} with status ${result.status}: ${result.statusText}.`);
            }
        }));
    }

    loadText(url: string): Promise<string> {
        const finalUrl = new URL(url, this.baseUrl);
        return PromisesProgress.add(fetch(finalUrl, { method: 'GET' }).then(result => {
            if (result.ok) {
                return result.text();
            } else {
                throw new Error(`Failed to fetch text resource ${finalUrl} with status ${result.status}: ${result.statusText}.`);
            }
        }));
    }
}