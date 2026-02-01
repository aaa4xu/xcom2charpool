# xcom2charpool

## Overview

`xcom2charpool` is a TypeScript library designed for reading and manipulating the charpool binary files used in the [XCOM 2](https://www.xcom.com) game. It provides a robust set of tools for parsing, serializing, and managing the complex data structures within these binary files, enabling developers and modders to create, modify, and analyze charpool data efficiently.
The library is not tied to a specific fs implementation; however, it includes an ArrayBuffer-based implementation that works seamlessly in both browser and Node.js environments. The core architecture is built around a Registry-driven Packer/Unpacker pair, plus a higher-level `CharacterPool` wrapper and Zod schemas for validation and typed access.

## Installation

```bash
npm i xcom2charpool
```

## Usage

### High-level API

```typescript
import {
    CharacterPool,
} from 'xcom2charpool';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

async function main() {
    const charpoolPath = path.join(os.homedir(), 'Documents/My Games/XCOM2 War of the Chosen/XComGame/CharacterPool');
    const charpool = CharacterPool.create();

    const file = await fs.readFile(path.join(charpoolPath, 'DefaultCharacterPool.bin'));
    const pool = charpool.read(file);

    console.log('Soldiers:');
    for (const soldier of pool.data.items) {
        console.log(`- ${soldier.value.strFirstName} ${soldier.value.strNickName} ${soldier.value.strLastName}`);
    }

    // Change name for characters
    for (const char of pool.data.items) {
        char.value.strFirstName = 'XCom';
        char.value.strLastName = 'Studio';
    }

    const output = charpool.write(pool);
    await fs.writeFile(path.join(charpoolPath, 'Importable', 'XCom-Studio.bin'), Buffer.from(output));
}

main();
```

## API Reference

-   **High-level helpers:**
    -   `CharacterPool`: Schema-aware wrapper over packer/unpacker.
    -   `CharacterPool.create()`: Uses built-in schema + registry defaults.
-   **Character pool helpers:**
    -   `CharacterPoolRegistry`: Preconfigured registry for known character pool array names.
    -   `CharacterPoolUnpacker`: File-level reader for charpool binaries.
    -   `CharacterPoolPacker`: File-level writer for charpool binaries.
-   **Schemas (Zod v4):**
    -   `CharacterPoolSchema`: Full file schema (state + data).
    -   `CharacterPoolDataItemSchema`: Soldier data schema.
    -   `TAppearanceSchema`: Appearance struct schema.
    -   `NamePropertySchema`, `StructPropertySchema`, `TypedArrayOfStructSchema`: Building blocks for custom schemas.
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
