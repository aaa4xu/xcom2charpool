import { statSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Unpacker } from './Unpacker';
import { Packer } from './Packer';
import { ArrayBufferReader } from './ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from './ArrayBuffer/ArrayBufferWriter';

describe('xcom2charpool', () => {
    const poolPath = path.join(__dirname, '../storage/validation.bin');
    let poolExists = false;
    try {
        statSync(poolPath);
        poolExists = true;
    } catch {}

    itif(poolExists)('should recreate charpool', async () => {
        const original = await fs.readFile(poolPath);
        const charpool = await readCharpool(original);
        const serialized = await generateCharpool(charpool.state, charpool.data);
        expect(serialized).toEqual(original.buffer);
    });
});

function itif(condition: boolean) {
    return condition ? test : test.skip;
}

async function readCharpool(buffer: Buffer) {
    // Create a DataView from the buffer
    const dataView = new DataView(buffer.buffer);

    // Initialize the reader and unpacker
    const reader = new ArrayBufferReader(dataView);
    const unpacker = new Unpacker(reader);

    // Parse the file
    return unpacker.readFile();
}

async function generateCharpool(state: Record<string, any>, data: any) {
    // Initialize the writer and packer
    const writer = new ArrayBufferWriter();
    const packer = new Packer(writer);

    // Serialize the data into binary format
    packer.writeFile({ state, data });

    // Retrieve the binary buffer
    return writer.getBuffer();
}