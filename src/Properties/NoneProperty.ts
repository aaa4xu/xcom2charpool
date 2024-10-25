import type { Writer } from '../Writer';

export class NoneProperty {
    public static readonly PropertyName = 'None';

    public static to(target: Writer) {
        return target.string(NoneProperty.PropertyName).padding();
    }
}
