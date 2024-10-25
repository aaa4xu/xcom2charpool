import { sum } from "./index";

describe('sum', () => {
    it('should sum numbers', () => {
        expect(sum(1, 2)).toBe(3);
    });
});