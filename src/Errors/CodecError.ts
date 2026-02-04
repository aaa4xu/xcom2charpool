/**
 * Error type for codec failures that carries the full property path for diagnostics.
 */
export class CodecError extends Error {
    public constructor(
        message: string,
        public readonly path: string,
        public readonly cause?: Error,
    ) {
        super(message);
        this.name = 'CodecError';
    }
}
