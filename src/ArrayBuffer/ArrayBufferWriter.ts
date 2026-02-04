import { Writer } from '../Writer';
import { UE4StringCodec } from '../UE4StringCodec';

/**
 * DataView-backed Writer with auto-growing buffer and UE4 string encoding.
 * Used by Packer and property factories to serialize binary data.
 */
export class ArrayBufferWriter implements Writer {
    public position = 0;
    #length = 0; // Actual length of data written
    #buffer: ArrayBuffer;
    #dataView: DataView;

    public constructor(initialSize = 1024) {
        this.#buffer = new ArrayBuffer(initialSize);
        this.#dataView = new DataView(this.#buffer);
    }

    /**
     * Writes a 32-bit unsigned integer at the current position.
     */
    uint32(value: number) {
        this.ensureCapacity(4);
        this.#dataView.setUint32(this.position, value, true);
        this.position += 4;
        this.#length = Math.max(this.#length, this.position);
        return this;
    }

    /**
     * Writes a 32-bit signed integer at the current position.
     */
    int32(value: number) {
        this.ensureCapacity(4);
        this.#dataView.setInt32(this.position, value, true);
        this.position += 4;
        this.#length = Math.max(this.#length, this.position);
        return this;
    }

    /**
     * Writes a byte at the current position.
     */
    byte(value: number) {
        this.ensureCapacity(1);
        this.#dataView.setUint8(this.position, value);
        this.position += 1;
        this.#length = Math.max(this.#length, this.position);
        return this;
    }

    /**
     * Writes padding (4 zero bytes) at the current position.
     */
    padding() {
        this.uint32(0);
        return this;
    }

    /**
     * Writes a string using UE4StringCodec
     */
    public string(value: string) {
        UE4StringCodec.write(this, value);
        return this;
    }

    /**
     * Retrieves the underlying buffer up to the current length of data written.
     * @returns A sliced ArrayBuffer containing the written data.
     */
    public getBuffer() {
        return this.#buffer.slice(0, this.#length);
    }

    public bytes(value: Uint8Array): Writer {
        this.ensureCapacity(value.length);
        new Uint8Array(this.#buffer, this.position, value.length).set(value);
        this.position += value.length;
        this.#length = Math.max(this.#length, this.position);
        return this;
    }

    public rewind(offset: number) {
        const newPosition = this.position + offset;
        if (newPosition < 0) {
            throw new Error('Rewind results in invalid position');
        }
        this.position = newPosition;
        return this;
    }

    public withLength(fn: () => void | number): void | number {
        const lengthPosition = this.position;
        this.uint32(0).padding();
        const sourceLength = this.position;
        const result = fn();
        const finalPosition = this.position;

        this.position = lengthPosition;
        this.uint32(typeof result === 'number' ? result : finalPosition - sourceLength);
        this.position = finalPosition;
        return result;
    }

    /**
     * Ensures the internal buffer has enough capacity to write additional bytes.
     */
    private ensureCapacity(additionalBytes: number) {
        const requiredLength = this.position + additionalBytes;
        if (requiredLength > this.#buffer.byteLength) {
            // Need to resize buffer
            let newBufferLength = this.#buffer.byteLength * 2;
            while (newBufferLength < requiredLength) {
                newBufferLength *= 2;
            }
            const newBuffer = new ArrayBuffer(newBufferLength);
            new Uint8Array(newBuffer).set(new Uint8Array(this.#buffer));
            this.#buffer = newBuffer;
            this.#dataView = new DataView(this.#buffer);
        }
    }
}
