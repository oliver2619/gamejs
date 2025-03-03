export class JsonLoader {

    private readonly baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl ?? '';
    }

    load<T>(url: string): Promise<T> {
        const finalUrl = new URL(url, this.baseUrl);
        return fetch(finalUrl).then(result => {
            if (result.ok) {
                return result.json();
            } else {
                throw new Error(`Failed to fetch JSON resource ${finalUrl} with status ${result.status}: ${result.statusText}.`);
            }
        });
    }
}