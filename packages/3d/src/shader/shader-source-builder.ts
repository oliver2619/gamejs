export class ShaderSource {

    constructor(readonly code: string) { }
}

export class ShaderSourceBuilder {

    private lines: string[] = [];

    add(line: string): ShaderSourceBuilder {
        this.lines.push(line);
        return this;
    }

    build(): ShaderSource {
        const code = this.lines.join('\n');
        return new ShaderSource(code);
    }
}