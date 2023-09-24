export class JsonLoader {

    private readonly baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl == undefined ? '' : baseUrl;
    }

    load<T>(url: string): Promise<T> {
        const finalUrl = `${this.baseUrl}/${url}`;
        return fetch(finalUrl).then(result => {
            if (result.ok) {
                return result.json();
            } else {
                throw new Error(`Failed to fetch JSON resource ${finalUrl} with status ${result.status}: ${result.statusText}`);
            }
        });
    }
}