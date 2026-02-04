/**
 * Value object for UE NameProperty including the instance id suffix.
 */
export class NamePropertyValue {
    #instanceId = 0;

    public constructor(
        public value: string,
        instanceId: number,
    ) {
        this.instanceId = instanceId;
    }

    public get instanceId(): number {
        return this.#instanceId;
    }

    public set instanceId(value: number) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error('NamePropertyValue instanceId must be a positive integer');
        }

        if (value > 0xffffffff) {
            throw new Error('NamePropertyValue instanceId cannot exceed 0xFFFFFFFF');
        }

        this.#instanceId = value;
    }

    public toString() {
        if (this.instanceId > 0) {
            return `${this.value}_${this.instanceId - 1}`;
        } else {
            return this.value;
        }
    }
}
