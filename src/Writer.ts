export interface Writer {
    position: number;

    /**
     * Writes a 32-bit unsigned integer at the current position.
     */
    uint32(value: number): Writer;

    /**
     * Writes a 32-bit signed integer at the current position.
     */
    int32(value: number): Writer;

    /**
     * Writes a byte at the current position.
     */
    byte(value: number): Writer;

    /**
     * Writes padding (4 zero bytes) at the current position.
     */
    padding(): Writer;

    /**
     * Writes a string with a length prefix and null-termination.
     * Automatically detects the encoding based on the characters used.
     * Uses some sort of ANSI for ASCII strings and UTF-16LE for strings with non-ASCII characters.
     */
    string(value: string): Writer;

    /**
     * Writes a raw byte sequence at the current position.
     */
    bytes(value: Uint8Array): Writer;

    rewind(offset: number): Writer;

    withLength(fn: () => void | number): void | number;
}
