# xcom2charpool

## Overview

`xcom2charpool` is a TypeScript library designed for reading and manipulating the charpool binary files used in the [XCOM 2](https://www.xcom.com) game. It provides a robust set of tools for parsing, serializing, and managing the complex data structures within these binary files, enabling developers and modders to create, modify, and analyze charpool data efficiently.
The library is not tied to a specific fs implementation; however, it includes an ArrayBuffer-based implementation that works seamlessly in both browser and Node.js environments. The core architecture is built around registry-driven property and array codecs with Zod v4 schemas for validation, plus file-level codecs that handle CharacterPool binaries.

## Installation

```bash
npm i xcom2charpool
```

## Usage

### Parse vanilla charpool

```typescript
import { ArrayBufferReader, ArrayBufferWriter, CharacterPoolFile } from 'xcom2charpool';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

async function main() {
    const charpoolPath = path.join(os.homedir(), 'Documents/My Games/XCOM2 War of the Chosen/XComGame/CharacterPool');
    const input = await fs.readFile(path.join(charpoolPath, 'DefaultCharacterPool.bin'));

    const reader = new ArrayBufferReader(new DataView(input.buffer));
    const fileCodec = new CharacterPoolFile();
    const data = fileCodec.read(reader);

    for (const soldier of data.CharacterPool) {
        soldier.value.strFirstName = 'XCom';
        soldier.value.strLastName = 'Studio';
    }

    const writer = new ArrayBufferWriter();
    fileCodec.write(writer, data);
    await fs.writeFile(path.join(charpoolPath, 'Importable', 'XCom-Studio.bin'), Buffer.from(writer.getBuffer()));
}

main();
```

### Parse charpool with Iridar's Appearance Manager

[Iridar's Appearance Manager](https://steamcommunity.com/sharedfiles/filedetails/?id=2664422411) (IAM) adds extra data inside `Props`, so use the IAM wrapper and schema.

```typescript
import { ArrayBufferReader, CharacterPoolFile, CharacterPoolFileWithIAM } from 'xcom2charpool';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

async function main() {
    const charpoolPath = path.join(os.homedir(), 'Documents/My Games/XCOM2 War of the Chosen/XComGame/CharacterPool');
    const input = await fs.readFile(path.join(charpoolPath, 'DefaultCharacterPool.bin'));

    const reader = new ArrayBufferReader(new DataView(input.buffer));
    const fileCodec = new CharacterPoolFileWithIAM(new CharacterPoolFile());
    const data = fileCodec.read(reader);

    const extraDatas = data.Props.ExtraDatas ?? [];
    console.log(`IAM entries: ${extraDatas.length}`);
}

main();
```

### Add support for a new mod

Add the mod-specific arrays to the registry and extend the base schema. This example mirrors the IAM approach but with a custom schema.

```typescript
import {
    ArrayOfStructSchema,
    CharacterPoolDataItemSchema,
    CharacterPoolFile,
    CharacterPoolSchema,
    StructArrayElement,
    StructSchema,
    TAppearanceSchema,
    Reader,
    Writer,
} from 'xcom2charpool';
import z from 'zod/v4';

const MyModCharacterPoolSchema = CharacterPoolSchema.extend({
    Props: z.looseObject({
        MyModData: ArrayOfStructSchema(
            'MyModDataElement',
            z.looseObject({
                CharPoolData: StructSchema('CharacterPoolDataElement', CharacterPoolDataItemSchema),
                AppearanceStore: ArrayOfStructSchema('Appearance', TAppearanceSchema.partial()),
                // Add your mod-specific fields here
            }),
        ).optional(),
    }),
});

class CharacterPoolFileWithMyMod {
    public constructor(private readonly file = new CharacterPoolFile()) {
        file.registry.registerArray('MyModData', new StructArrayElement('MyModDataElement'));
        file.registry.registerArray('AppearanceStore', new StructArrayElement('Appearance'));
    }

    public read(reader: Reader) {
        const data = this.file.read(reader);
        MyModCharacterPoolSchema.parse(data);
        return data as z.infer<typeof MyModCharacterPoolSchema>;
    }

    public write(writer: Writer, file: unknown) {
        MyModCharacterPoolSchema.parse(file);
        this.file.write(writer, file);
    }
}
```

## Testing

The library includes a number of unit tests to ensure the correctness of reading and writing operations.

```bash
pnpm run test
```
