import fs from 'node:fs/promises';
import { CharacterPoolFile } from './CharacterPoolFile';
import path from 'node:path';
import crypto from 'node:crypto';
import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { CharacterPoolFileWithIAM } from './CharacterPoolFileWithIAM';

describe('CharacterPoolFile', () => {
    it.each([
        ['should recreate vanilla WOTC charpool', 'vanilla.bin', new CharacterPoolFile()],
        ['should recreate WOTC+IAM charpool', 'iam.bin', new CharacterPoolFileWithIAM(new CharacterPoolFile())],
    ])(`%s`, async (_, filename, fileCodec) => {
        const original = await fixture(filename);

        const reader = new ArrayBufferReader(new DataView(original.buffer));
        const writer = new ArrayBufferWriter();

        const payload = fileCodec.read(reader);
        fileCodec.write(writer, payload);

        expect(md5(Buffer.from(writer.getBuffer()))).toEqual(md5(original));
    });
});

const md5 = (buf: Buffer) => crypto.createHash('md5').update(buf).digest('hex');
const fixture = (filename: string) => fs.readFile(path.join(__dirname, '__fixtures__', filename));
