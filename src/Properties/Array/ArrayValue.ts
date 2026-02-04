/**
 * Raw array payload wrapper used to preserve unknown arrays for round-trip.
 */
export class ArrayValue {
    public constructor(
        public readonly count: number,
        public readonly payload: Uint8Array,
    ) {}
}
