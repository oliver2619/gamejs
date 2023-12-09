import { Input } from "./input";

export class InputSet {

    private readonly checkedInputs: Input<any>[] = [];
    private readonly uncheckedInputs: Input<any>[] = [];
    private readonly enabledBy = new Set<any>();

    addInput(input: Input<any>) {
        input.setEnabledBy(this, this.enabledBy.size > 0);
        if (input.needsStateCheck) {
            this.checkedInputs.push(input);
        } else {
            this.uncheckedInputs.push(input);
        }
    }

    checkState() {
        this.checkedInputs.forEach(it => it.checkState());
    }

    setEnabledBy(holder: any, enabled: boolean) {
        const wasEnabled = this.enabledBy.size > 0;
        if (enabled) {
            this.enabledBy.add(holder);
        } else {
            this.enabledBy.delete(holder);
        }
        const isEnabled = this.enabledBy.size > 0;
        if (wasEnabled !== isEnabled) {
            this.checkedInputs.forEach(it => it.setEnabledBy(this, isEnabled));
            this.uncheckedInputs.forEach(it => it.setEnabledBy(this, isEnabled));
        }
    }

    removeInput(input: Input<any>) {
        if (input.needsStateCheck) {
            const found = this.checkedInputs.findIndex(it => it === input);
            if (found >= 0) {
                this.checkedInputs.splice(found, 1);
                input.setEnabledBy(this, false);
            }
        } else {
            const found = this.uncheckedInputs.findIndex(it => it === input);
            if (found >= 0) {
                this.uncheckedInputs.splice(found, 1);
                input.setEnabledBy(this, false);
            }
        }
    }

    reset() {
        this.uncheckedInputs.forEach(it => it.reset());
        this.checkedInputs.forEach(it => it.reset());
    }
}