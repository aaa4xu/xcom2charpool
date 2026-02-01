import type { Writer } from '../Writer';

/**
 * Sentinel property that marks the end of a property list in UE4 serialization.
 * Emitted by Packer and consumed by Unpacker and StructProperty parsing.
 */
export class NoneProperty {
    public static readonly type = 'NoneProperty';
    public static readonly PropertyName = 'None';

    public static to(target: Writer) {
        return target.string(NoneProperty.PropertyName).padding();
    }
}
