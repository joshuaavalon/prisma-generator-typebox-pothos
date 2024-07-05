#!/usr/bin/env node

import generatorHelper from "@prisma/generator-helper";
import { onGenerate } from "./on-generate.js";
import { onManifest } from "./on-manifest.js";

const { generatorHandler } = generatorHelper;

generatorHandler({ onManifest, onGenerate });
