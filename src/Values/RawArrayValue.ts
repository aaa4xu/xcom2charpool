export class RawArrayValue {
    public constructor(
        public readonly count: number,
        public readonly payload: Uint8Array,
    ) {}
}
