import { ObjectPropertyValue } from '../ObjectProperty';

/**
 * Value wrapper for structured properties carrying the struct type and payload.
 */
export class StructPropertyValue {
    public constructor(
        public type: string,
        public value: ObjectPropertyValue,
    ) {}
}
