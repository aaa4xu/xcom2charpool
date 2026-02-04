/**
 * Value object for ByteProperty preserving both type name and value.
 */
export class BytePropertyValue {
    public constructor(
        public type: string,
        public value: string,
    ) {}
}
