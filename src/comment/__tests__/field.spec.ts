import { assert } from "chai";
import { parseField } from "../field.js";

import type { DMMF } from "@prisma/generator-helper";

describe("Test parseField", () => {
  it("should be ignore", async () => {
    const cfg = parseField({ documentation: "@Pothos.ignore(A, B, C)" } as DMMF.Field);
    assert.isArray(cfg.ignore);
    assert.deepEqual(cfg.ignore, ["A", "B", "C"]);
    assert.isFalse(cfg.select);
    assert.isUndefined(cfg.name);
    assert.isUndefined(cfg.type);
  });

  it("should be select", async () => {
    const cfg = parseField({ documentation: "@Pothos.select" } as DMMF.Field);
    assert.isArray(cfg.ignore);
    assert.isTrue(cfg.select);
    assert.isUndefined(cfg.name);
    assert.isUndefined(cfg.type);
  });

  it("should be type", async () => {
    const cfg = parseField({ documentation: "@Pothos.type(UUID)" } as DMMF.Field);
    assert.isArray(cfg.ignore);
    assert.isFalse(cfg.select);
    assert.isUndefined(cfg.name);
    assert.strictEqual(cfg.type, "UUID");
  });
});
