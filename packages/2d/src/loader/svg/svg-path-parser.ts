import { Vector2d } from "@pluto/core";
import { SvgPathPort } from "./svg-port-bak";

export class SvgPathParser {

    private readonly firstPoint: Vector2d;
    private readonly currentCoords: Vector2d;
    private readonly lastControlPoint: Vector2d;
    private readonly numbers: number[] = [];
    private index = 0;
    private currentCommand: string | undefined;
    private firstPointSet = false;

    private constructor(private readonly path: string, private readonly viewboxLeft: number, private readonly viewboxBottom: number, private readonly port: SvgPathPort) {
        this.currentCoords = new Vector2d(-viewboxLeft, viewboxBottom);
        this.firstPoint = this.currentCoords.clone();
        this.lastControlPoint = this.currentCoords.clone();
    }

    static parse(path: string, viewboxLeft: number, viewboxBottom: number, port: SvgPathPort) {
        new SvgPathParser(path.trim(), viewboxLeft, viewboxBottom, port)._parse();
    }

    private _parse() {
        const regex = /(?<cmd>[mMlLhHvVzZcCsSqQtTaA])|(?:[\s,]+)|(?<num>-?(?:(?:\d+\.?\d*)|(?:\d*\.?\d+))(?:[eE]-?\d+)?)/gmy;
        while (this.index < this.path.length) {
            regex.lastIndex = this.index;
            const result = regex.exec(this.path);
            if (result == null || result.groups == undefined) {
                throw new RangeError(`Unable to parse path '${this.path.substring(this.index)}'`);
            }
            if (result.groups['cmd'] != undefined) {
                this.startCommand(result.groups['cmd']);
            } else if (result.groups['num'] != undefined) {
                this.addNumber(Number.parseFloat(result.groups['num']));
            }
            this.index = result.index + result[0].length;
        }
        this.endCommand();
    }

    private startCommand(cmd: string) {
        this.endCommand();
        if (cmd === 'z' || cmd === 'Z') {
            this.port.closePath();
            this.currentCoords.setVector(this.firstPoint);
            this.lastControlPoint.setVector(this.firstPoint);
            this.firstPointSet = false;
        } else {
            this.currentCommand = cmd;
        }
    }

    private addNumber(num: number) {
        if (this.currentCommand == undefined) {
            throw new RangeError('Syntax error in path. Number unexpected');
        }
        this.numbers.push(num);
    }

    private endCommand() {
        if (this.currentCommand != undefined) {
            switch (this.currentCommand) {
                case 'm':
                    this.moveTo(true);
                    break;
                case 'M':
                    this.moveTo(false);
                    break;
                case 'l':
                    this.lineTo(true);
                    break;
                case 'L':
                    this.lineTo(false);
                    break;
                case 'h':
                    this.hLineTo(true);
                    break;
                case 'H':
                    this.hLineTo(false);
                    break;
                case 'v':
                    this.vLineTo(true);
                    break;
                case 'V':
                    this.vLineTo(false);
                    break;
                case 'c':
                    this.cubicBezierTo(true);
                    break;
                case 'C':
                    this.cubicBezierTo(false);
                    break;
                case 's':
                    this.shorthandCubicBezierTo(true);
                    break;
                case 'S':
                    this.shorthandCubicBezierTo(false);
                    break;
                case 'q':
                    this.quadraticBezierTo(true);
                    break;
                case 'Q':
                    this.quadraticBezierTo(false);
                    break;
                case 't':
                    this.shorthandQuadraticBezierTo(true);
                    break;
                case 'T':
                    this.shorthandQuadraticBezierTo(false);
                    break;
                case 'a':
                    this.arcTo(true);
                    break;
                case 'A':
                    this.arcTo(false);
            }
            this.currentCommand = undefined;
        }
        this.numbers.splice(0, this.numbers.length);
    }

    private moveTo(relative: boolean) {
        if ((this.numbers.length % 2) !== 0) {
            throw new RangeError('Moveto command must contain x and y coordinates');
        }
        for (let i = 0; i < this.numbers.length; i += 2) {
            this.updateCursor(this.numbers[i]!, this.numbers[i + 1]!, relative);
            if (i === 0) {
                this.port.moveTo(this.currentCoords.clone());
                if (!this.firstPointSet) {
                    this.firstPoint.setVector(this.currentCoords);
                    this.firstPointSet = true;
                }
            } else {
                this.port.lineTo(this.currentCoords.clone());
            }
        }
        this.lastControlPoint.setVector(this.currentCoords);
    }

    private lineTo(relative: boolean) {
        if ((this.numbers.length % 2) !== 0) {
            throw new RangeError('Lineto command must contain x and y coordinates');
        }
        for (let i = 0; i < this.numbers.length; i += 2) {
            this.updateCursor(this.numbers[i]!, this.numbers[i + 1]!, relative);
            this.port.lineTo(this.currentCoords.clone());
        }
        this.lastControlPoint.setVector(this.currentCoords);
    }

    private hLineTo(relative: boolean) {
        this.numbers.forEach(x => {
            this.updateCursor(x, relative ? 0 : this.currentCoords.y, relative);
            this.port.lineTo(this.currentCoords.clone());
        });
        this.lastControlPoint.setVector(this.currentCoords);
    }

    private vLineTo(relative: boolean) {
        this.numbers.forEach(y => {
            this.updateCursor(relative ? 0 : this.currentCoords.x, y, relative);
            this.port.lineTo(this.currentCoords.clone());
        });
        this.lastControlPoint.setVector(this.currentCoords);
    }

    private cubicBezierTo(relative: boolean) {
        if ((this.numbers.length % 6) !== 0) {
            throw new RangeError('Cubic curveto command must contain three points');
        }
        for (let i = 0; i < this.numbers.length; i += 6) {
            const p1 = this.getControlPoint(this.numbers[i]!, this.numbers[i + 1]!, relative);
            const p2 = this.getControlPoint(this.numbers[i + 2]!, this.numbers[i + 3]!, relative);
            this.updateCursor(this.numbers[i + 4]!, this.numbers[i + 5]!, relative);
            this.port.cubicCurveTo(p1, p2, this.currentCoords.clone());
            this.lastControlPoint.setVector(p2);
        }
    }

    private shorthandCubicBezierTo(relative: boolean) {
        if ((this.numbers.length % 4) !== 0) {
            throw new RangeError('Shorthand cubic curveto command must contain two points');
        }
        for (let i = 0; i < this.numbers.length; i += 6) {
            const p1 = this.getAutoControlPoint(this.numbers[i + 2]!, this.numbers[i + 3]!, relative);
            const p2 = this.getControlPoint(this.numbers[i]!, this.numbers[i + 1]!, relative);
            this.updateCursor(this.numbers[i + 2]!, this.numbers[i + 3]!, relative);
            this.port.cubicCurveTo(p1, p2, this.currentCoords.clone());
            this.lastControlPoint.setVector(p2);
        }
    }

    private quadraticBezierTo(relative: boolean) {
        if ((this.numbers.length % 4) !== 0) {
            throw new RangeError('Quadratic curveto command must contain two points');
        }
        for (let i = 0; i < this.numbers.length; i += 6) {
            const p1 = this.getControlPoint(this.numbers[i]!, this.numbers[i + 1]!, relative);
            this.updateCursor(this.numbers[i + 2]!, this.numbers[i + 3]!, relative);
            this.port.quadraticCurveTo(p1, this.currentCoords.clone());
            this.lastControlPoint.setVector(p1);
        }
    }

    private shorthandQuadraticBezierTo(relative: boolean) {
        if ((this.numbers.length % 2) !== 0) {
            throw new RangeError('Shorthand quadratic curveto command must contain x and y coordinates');
        }
        for (let i = 0; i < this.numbers.length; i += 6) {
            const p1 = this.getAutoControlPoint(this.numbers[i]!, this.numbers[i + 1]!, relative);
            this.updateCursor(this.numbers[i]!, this.numbers[i + 1]!, relative);
            this.port.quadraticCurveTo(p1, this.currentCoords.clone());
            this.lastControlPoint.setVector(p1);
        }
    }

    private arcTo(_relative: boolean) {
        console.warn('Arc in path not implemented yet.');
        // TODO implement
    }

    private getAutoControlPoint(x: number, y: number, relative: boolean): Vector2d {
        const nextPoint = relative ? new Vector2d(this.currentCoords.x + x, this.currentCoords.y - y) : new Vector2d(x - this.viewboxLeft, this.viewboxBottom - y);
        const delta = nextPoint.getDifference(this.lastControlPoint);
        return nextPoint.getSum(delta);
    }

    private getControlPoint(x: number, y: number, relative: boolean): Vector2d {
        return relative ? new Vector2d(this.currentCoords.x + x, this.currentCoords.y - y) : new Vector2d(x - this.viewboxLeft, this.viewboxBottom - y);
    }

    private updateCursor(x: number, y: number, relative: boolean) {
        if (relative) {
            this.currentCoords.x += x;
            this.currentCoords.y -= y;
        } else {
            this.currentCoords.x = x - this.viewboxLeft;
            this.currentCoords.y = this.viewboxBottom - y;
        }
    }
}