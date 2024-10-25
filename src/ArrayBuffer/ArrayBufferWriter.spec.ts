import { ArrayBufferWriter } from './ArrayBufferWriter';
import { Packer } from '../Packer';
import { binary as cases } from './__fixtures__/binary';

describe('ArrayBufferWriter', () => {
  test.each(
    Object.entries(cases).map(([name, config]) => [
      name,
      (packer: Packer) => packer.writeProperty(config.name, config.value),
      config.bytes,
    ])
  )('should write %s', (_, fn, data) => {
    const writer = new ArrayBufferWriter();
    const packer = new Packer(writer);
    fn(packer);
    expect(new Uint8Array(writer.getBuffer())).toStrictEqual(Uint8Array.from(data));
  });
});
