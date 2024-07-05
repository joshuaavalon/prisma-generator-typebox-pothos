# @joshuaavalon/prisma-generator-typebox-pothos

It is designed for generating code for Prisma, TypeBox and Pothos.

It is not designed to generating everything. You must modify the code to fit.

## Getting Started

```
npm i -D @joshuaavalon/prisma-generator-typebox-pothos
```

Add the following snippet to to `schema.prisma`.

```prisma
generator typeboxPothos {
  provider                      = "prisma-generator-typebox-pothos"
  output                        = "../src/tmp/"
  typePackage                   = "#schema"
  enableUnchecked               = "false"  /// Optional
  defaultFieldNullability       = "false"
  defaultInputFieldRequiredness = "false"
  scalarMappings                = [BigInt#String] /// Optional
  authScopes                    = "#auth" /// Optional
}
```

Then, run `prisma generate`.

It is recommend to remove snippet after codegen to prevent overwrite code changes.

## Usage

### Options

#### typePackage

Package name that export your Schema Type. You can subpath import.
Here is a example.

```ts
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import type { Inputs } from "./tmp/index.js";

interface GraphqlContext {}

type PrismaObjects = { [key in keyof PrismaTypes]: PrismaTypes[key]["Shape"] };

export interface SchemaType extends Partial<PothosSchemaTypes.UserSchemaTypes> {
  PrismaTypes: PrismaTypes;
  DefaultFieldNullability: false;
  DefaultInputFieldRequiredness: false;
  Context: GraphqlContext;
  Scalars: {
    ID: { Input: string; Output: string };
    BigInt: { Input: string; Output: bigint };
    UUID: { Input: string; Output: string };
    Date: { Input: Date; Output: Date };
    DateTime: { Input: Date; Output: Date };
    File: { Input: File; Output: never };
  };
  Inputs: Inputs;
  Interfaces: Interfaces;
  Objects: PrismaObjects;
}

interface Interfaces {
  Item: {};
}
```

#### enableUnchecked

Enable codegen for unchecked type of prisma.

You probably do not need to enable it.

#### defaultFieldNullability

It should be the same to your Pothos configuration.

#### defaultInputFieldRequiredness

It should be the same to your Pothos configuration.

#### scalarMappings

Change **ALL** the scalar type of object from one type to another.
For example, `[BigInt#String]` change `BigInt` to `String`.

Note that it only changes GraphQL type.

### authScopes

Import `authScopes` from the package name and set it to all object fields.

`@pothos/plugin-scope-auth` is needed.

### Comment

This section is about per model / field configuration via comment.

#### Model

##### @Pothos.ignore

This ignores target model in code generation, including all related inputs and filters.

If target model has not nullable relation, you must edit the input before passing it to Prisma.

```prisma
/// @Pothos.ignore
model User {
  id     String     @id @default(uuid())
}
```

##### @Pothos.interfaces

This add `interfaces` to the GraphQL object.
The value is comma-separated.

It **does not** check if the interface is valid or not. Please ensure it is type checked.

```prisma
/// @Pothos.interfaces(Item)
model User {
  id     String     @id @default(uuid())
}
```

```ts
builder.prismaObject("User", {
  interfaces: ["Item"],
  fields: (t) => ({
    id: t.expose("id", { type: "String" })
  })
});
```

#### Field

##### @Pothos.ignore

This ignores the field if the model name is **end with** the value.
`__Object` can be used to ignore in GraphQL object.
The value is comma-separated.

It is recommended to use it to prevent edit or query certain fields.

```prisma
model User {
  /// @Pothos.ignore(CreateInput, UpdateInput)
  id               String     @id @default(uuid())
  /// @Pothos.ignore(WhereInput, WhereUniqueInput)
  passwordHash     String
}
```

##### @Pothos.select

This set the value of `select` in `prismaObject`.
The value is comma-separated.

Please refer to [Pothos documentation](https://pothos-graphql.dev/docs/plugins/prisma#select-mode-for-types).

```prisma
model User {
  /// @Pothos.select
  id     String     @id @default(uuid())
}
```

```ts
builder.prismaObject("User", {
  select: { id: true },
  fields: (t) => ({
    id: t.expose("id", { type: "String" })
  })
});
```

##### @Pothos.name

It changes the name of exposed field in `prismaObject` **only**.

Note that is does not change in other generated code like input or filter because a transform in TypeBox schema is required.

```prisma
model User {
  /// @Pothos.name(id2)
  id     String     @id @default(uuid())
}
```

```ts
builder.prismaObject("User", {
  fields: (t) => ({
    id2: t.expose("id", { type: "String" })
  })
});
```

##### @Pothos.type

It changes the type of field in `prismaObject` and input but not filter.

It is recommend to use with `@Pothos.filterType` to use custom filter type.

```prisma
model User {
  /// @Pothos.type(UUID)
  id     String     @id @default(uuid())
}
```

```ts
builder.prismaObject("User", {
  fields: (t) => ({
    id: t.expose("id", { type: "UUID" })
  })
});
```

##### @Pothos.filterType

It changes the type of filter of field used in `WhereInput` or similar input.

```prisma
model User {
  /// @Pothos.filterType(UUIDFilter)
  id     String     @id @default(uuid())
}
```

## Known Issues

### `WhereInput` is not generated on `WhereInput` and `RelationFilter`

This is because it will cause circular import when creating TypeBox schema.
You need to added you relation filter as needed.
