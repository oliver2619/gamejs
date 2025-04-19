import { RenderingContext2d } from "../component/rendering-context-2d";
import { Body2d, Body2dData } from "./body-2d";
import { CollisionMnemento } from "./collision-mnemento";
import { DynamicCircle } from "./dynamic-circle";
import { ForceConstraints } from "./force-constraints";

export interface StaticBody2dData extends Body2dData {
}

export abstract class StaticBody2d extends Body2d {

    protected constructor(data: StaticBody2dData) {
        super(data);
    }

    abstract getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento): void;

    abstract getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints): void;

    render() {
        const context = RenderingContext2d.currentCanvasRenderingContext2d;
        context.strokeStyle = this.enabled ? '#00ff00' : '#ff0000';
        this.onRender(context);
        context.stroke();
    }

    protected abstract onRender(context: CanvasRenderingContext2D): void;
}