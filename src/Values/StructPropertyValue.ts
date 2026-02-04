import { ObjectPropertyValue } from '../Codecs/ObjectProperty';

export class StructPropertyValue {
    public constructor(
        public type: string,
        public value: ObjectPropertyValue,
    ) {}
}
