import type { CodecRegistry } from './Registry';

export interface CodecContext {
    readonly registry: CodecRegistry;
    readonly path: string[];
}
