/** Обертка над данными с поддержкой чтения нужного набора типов данных и внутренним счетчиком позиции */
export interface Reader {
    readonly length: number;
    readonly position: number;

    uint32(): number;

    int32(): number;

    string(): string;

    byte(): number;

    subarray(length: number): Reader;

    padding(): void;

    /**
     * Reads a raw byte sequence and advances the cursor.
     */
    bytes(length: number): Uint8Array;
}
