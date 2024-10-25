# xcom2charpool

## Overview

`xcom2charpool` is a TypeScript library designed for reading and manipulating the charpool binary files used in the [XCOM 2](https://www.xcom.com) game. It provides a robust set of tools for parsing, serializing, and managing the complex data structures within these binary files, enabling developers and modders to create, modify, and analyze charpool data efficiently.
The library is not tied to a specific fs implementation; however, it includes an ArrayBuffer-based implementation that works seamlessly in both browser and Node.js environments.

```bash
npm install xcom2charpool
```

## Usage

TODO

## API Reference

- **Serialization Utilities:**
  - `Packer`: Handles the serialization of data structures into binary format.
  - `Unpacker`: Handles the deserialization of binary data into structured formats.
- **Reader & Writer:**
  - `ArrayBufferReader`: Implements the `Reader` interface for reading binary data.
  - `ArrayBufferWriter`: Implements the `Writer` interface with dynamic buffer resizing and encoding support.

- **Property Classes:**
  - `IntProperty`, `StrProperty`, `BoolProperty`, `ByteProperty`, `NameProperty`, `NoneProperty`, `StructProperty`: Define various property types for handling different data formats.
  - `PropertyFactory`: Interface for property creation and serialization.

- **Array Handling:**
  - `ArrayOfStructs`, `CharacterPoolDataElements`, `ArrayOfInt`: Manage arrays of structured data and integers.
  - `ArrayFactory`: Interface for creating array instances.

## Testing

The library includes a number of unit tests to ensure the correctness of reading and writing operations.

```bash
pnpm test
```