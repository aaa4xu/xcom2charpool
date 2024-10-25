# xcom2charpool

## Overview

`xcom2charpool` is a TypeScript library designed for reading and manipulating the charpool binary files used in the [XCOM 2](https://www.xcom.com) game. It provides a robust set of tools for parsing, serializing, and managing the complex data structures within these binary files, enabling developers and modders to create, modify, and analyze charpool data efficiently.
The library is not tied to a specific fs implementation; however, it includes an ArrayBuffer-based implementation that works seamlessly in both browser and Node.js environments.

## Installation

```bash
npm i xcom2charpool
```

## Usage

```typescript
import { Unpacker, Packer, ArrayBufferReader, ArrayBufferWriter } from 'xcom2charpool';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

async function main() {
    const charpoolPath = path.join(os.homedir(), 'Documents/My Games/XCOM2 War of the Chosen/XComGame/CharacterPool');

    // Read data from the current character pool
    const { state, data } = await readCharpool(path.join(charpoolPath, 'DefaultCharacterPool.bin'));

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
    await writeCharpool(path.join(charpoolPath, 'Importable', 'XCom-Studio.bin'), state, data);
}

// Function to read and parse a charpool binary file
async function readCharpool(filePath: string) {
    // Read the binary file
    const buffer = await fs.readFile(filePath);

    // Create a DataView from the buffer
    const dataView = new DataView(buffer.buffer);

    // Initialize the reader and unpacker
    const reader = new ArrayBufferReader(dataView);
    const unpacker = new Unpacker(reader);

    // Parse the file
    return unpacker.readFile();
}

// Function to create and write a charpool binary file
async function writeCharpool(filePath: string, state: Record<string, any>, data: any) {
    // Initialize the writer and packer
    const writer = new ArrayBufferWriter();
    const packer = new Packer(writer);

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

-   **Serialization Utilities:**
    -   `Packer`: Handles the serialization of data structures into binary format.
    -   `Unpacker`: Handles the deserialization of binary data into structured formats.
-   **Reader & Writer:**

    -   `ArrayBufferReader`: Implements the `Reader` interface for reading binary data.
    -   `ArrayBufferWriter`: Implements the `Writer` interface with dynamic buffer resizing and encoding support.

-   **Property Classes:**

    -   `IntProperty`, `StrProperty`, `BoolProperty`, `ByteProperty`, `NameProperty`, `NoneProperty`, `StructProperty`: Define various property types for handling different data formats.
    -   `PropertyFactory`: Interface for property creation and serialization.

-   **Array Handling:**
    -   `ArrayOfStructs`, `CharacterPoolDataElements`, `ArrayOfInt`: Manage arrays of structured data and integers.
    -   `ArrayFactory`: Interface for creating array instances.

## Testing

The library includes a number of unit tests to ensure the correctness of reading and writing operations.

```bash
pnpm test
```
