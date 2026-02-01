import { statSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { CharacterPoolUnpacker } from './CharacterPool/CharacterPoolUnpacker';
import { CharacterPoolPacker } from './CharacterPool/CharacterPoolPacker';
import { ArrayBufferReader } from './Core/ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from './Core/ArrayBuffer/ArrayBufferWriter';
import { Registry } from './Core/Registry';
import { CharacterPoolRegistry } from './CharacterPool/CharacterPoolRegistry';

describe('xcom2charpool', () => {
    const poolPath = path.join(__dirname, '../storage/validation.bin');
    let poolExists = false;
    try {
        statSync(poolPath);
        poolExists = true;
    } catch {}

    itif(poolExists)('should recreate charpool', async () => {
        const registry = new CharacterPoolRegistry();

        const original = await fs.readFile(poolPath);
        const charpool = await readCharpool(original, registry);
        const serialized = await generateCharpool(charpool.state, charpool.data, registry);
        const deserialized = await readCharpool(Buffer.from(serialized), registry);

        await fs.writeFile(poolPath + '.generated', Buffer.from(serialized));

        expect(md5(Buffer.from(serialized))).toEqual(md5(original));
    });
});

const md5 = (buf: Buffer) => crypto.createHash('md5').update(buf).digest('hex');

function itif(condition: boolean) {
    return condition ? test : test.skip;
}

async function readCharpool(buffer: Buffer, registry: Registry) {
    // Create a DataView from the buffer
    const dataView = new DataView(buffer.buffer);

    // Initialize the reader and unpacker
    const reader = new ArrayBufferReader(dataView);
    const unpacker = new CharacterPoolUnpacker(reader, registry);

    // Parse the file
    return unpacker.readFile();
}

async function generateCharpool(state: Record<string, any>, data: any, registry: Registry) {
    // Initialize the writer and packer
    const writer = new ArrayBufferWriter();
    const packer = new CharacterPoolPacker(writer, registry);

    // Serialize the data into binary format
    packer.writeFile({ state, data });

    // Retrieve the binary buffer
    return writer.getBuffer();
}
