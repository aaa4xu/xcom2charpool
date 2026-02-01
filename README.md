# xcom2charpool

## Overview

`xcom2charpool` is a TypeScript library designed for reading and manipulating the charpool binary files used in the [XCOM 2](https://www.xcom.com) game. It provides a robust set of tools for parsing, serializing, and managing the complex data structures within these binary files, enabling developers and modders to create, modify, and analyze charpool data efficiently.
The library is not tied to a specific fs implementation; however, it includes an ArrayBuffer-based implementation that works seamlessly in both browser and Node.js environments. The core architecture is built around a Registry-driven Packer/Unpacker pair and UE4-compatible string serialization.

## Installation

```bash
npm i xcom2charpool
```

## Usage

```typescript
import {
    ArrayBufferReader,
    ArrayBufferWriter,
    CharacterPoolPacker,
    CharacterPoolUnpacker,
} from 'xcom2charpool';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

async function main() {
    const charpoolPath = path.join(os.homedir(), 'Documents/My Games/XCOM2 War of the Chosen/XComGame/CharacterPool');
    const registry = new CharacterPoolRegistry();

    // Read data from the current character pool
    const { state, data } = await readCharpool(path.join(charpoolPath, 'DefaultCharacterPool.bin'), registry);

    console.log('Soldiers:');
    for (const soldier of data.items) {
        console.log(`- ${soldier.value.strFirstName} ${soldier.value.strNickName} ${soldier.value.strLastName}`);
    }

    // Change name for characters
    for (const char of data.items) {
        char.value.strFirstName = 'XCom';
        char.value.strLastName = 'Studio';
    }

    // Save data to new character pool
    await writeCharpool(path.join(charpoolPath, 'Importable', 'XCom-Studio.bin'), state, data, registry);
}

// Function to read and parse a charpool binary file
async function readCharpool(filePath: string) {
    // Read the binary file
    const buffer = await fs.readFile(filePath);

    // Create a DataView from the buffer
    const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    // Initialize the reader and unpacker
    const reader = new ArrayBufferReader(dataView);
    const unpacker = new CharacterPoolUnpacker(reader);

    // Parse the file
    return unpacker.readFile();
}

// Function to create and write a charpool binary file
async function writeCharpool(
    filePath: string,
    state: Record<string, any>,
    data: any,
) {
    // Initialize the writer and packer
    const writer = new ArrayBufferWriter();
    const packer = new CharacterPoolPacker(writer);

    // Serialize the data into binary format
    packer.writeFile({ state, data });

    // Retrieve the binary buffer
    const buffer = writer.getBuffer();
    console.log(buffer.byteLength);

    // Write the buffer to a file
    await fs.writeFile(filePath, Buffer.from(buffer));
}

main();
```

## API Reference

-   **Character pool helpers:**
    -   `CharacterPoolRegistry`: Preconfigured registry for known character pool array names.
    -   `CharacterPoolUnpacker`: File-level reader for charpool binaries.
    -   `CharacterPoolPacker`: File-level writer for charpool binaries.
-   **Core serialization:**
    -   `Registry`: Registry of property and array factories.
    -   `Packer`: Serializes property graphs into UE4 binary format.
    -   `Unpacker`: Deserializes UE4 binary data into structured JS objects.
-   **Reader & Writer:**
    -   `ArrayBufferReader`: DataView-backed reader for binary data.
    -   `ArrayBufferWriter`: DataView-backed writer with auto-growing buffer.
-   **Property classes:**
    -   `ArrayProperty`, `StructProperty`, `IntProperty`, `StrProperty`, `BoolProperty`, `ByteProperty`, `NameProperty`, `NoneProperty`.
    -   `PropertyFactory`: Interface for property creation and serialization.
-   **Array handling:**
    -   `TypedArray`: Wrapper for typed array properties.
    -   `ArrayFactory`: Interface for creating array instances.
-   **String codec:**
    -   `UE4StringCodec`: UE4-compatible FString encoder/decoder.

## Testing

The library includes a number of unit tests to ensure the correctness of reading and writing operations.

```bash
pnpm run test
```
