import { Codec } from './Codec';

export interface TypeCodec<T = unknown> extends Codec<T> {
    readonly type: string;
    isSupported(value: unknown): value is T;
}
