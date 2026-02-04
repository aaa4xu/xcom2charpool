import { Reader } from './Reader';
import { CodecContext } from './CodecContext';
import { CodecError } from './Errors/CodecError';

export abstract class BaseCodec {
    protected childContext(name: string, ctx: CodecContext): CodecContext {
        return {
            ...ctx,
            path: [...ctx.path, name],
        };
    }

    protected propName(ctx: CodecContext) {
        return ctx.path.length > 0 ? ctx.path[ctx.path.length - 1] : '';
    }

    protected fullPath(ctx: CodecContext): string {
        if (!ctx.path.length) return '<root>';

        let out = ctx.path[0];
        for (let i = 1; i < ctx.path.length; i++) {
            const seg = ctx.path[i];
            out += seg.startsWith('[') ? seg : `.${seg}`;
        }

        return out;
    }

    protected readSized<T>(reader: Reader, length: number, ctx: CodecContext, fn: (r: Reader) => T): T {
        const payload = reader.subarray(length);

        let val: T;
        try {
            val = fn(payload);
        } catch (e) {
            if (e instanceof CodecError) throw e;

            if (e instanceof Error) {
                throw new CodecError(e.message, this.fullPath(ctx), e);
            } else {
                throw new CodecError(`${e}`, this.fullPath(ctx));
            }
        }

        if (payload.position !== payload.length) {
            throw new CodecError(
                `Payload size mismatch: ${payload.length - payload.position} bytes remaining`,
                this.fullPath(ctx),
            );
        }

        return val;
    }
}
