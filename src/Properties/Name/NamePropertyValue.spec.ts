import { NamePropertyValue } from './NamePropertyValue';

describe('NamePropertyValue', () => {
    it('should generate a valid name for non-instance name', () => {
        const name = new NamePropertyValue('Test', 0);
        expect(name.toString()).toBe('Test');
    });

    it('should generate a valid name for instance name', () => {
        const name = new NamePropertyValue('Test', 1);
        expect(name.toString()).toBe('Test_0');
    });

    it('should throw an error for negative instance id', () => {
        expect(() => new NamePropertyValue('Test', -1)).toThrow();
    });

    it('should throw an error for instance id over uint32 range', () => {
        expect(() => new NamePropertyValue('Test', Number.MAX_SAFE_INTEGER)).toThrow();
    });
});
