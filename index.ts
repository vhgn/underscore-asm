import { compile as _compile, init as _init } from "./src/compile";
import { parse as _parse, inject as _inject } from "./src/parse";
import { run  as _run } from "./src/run";

import type {
	CompileError,
	VM,
	CompiledMemory,
	InstructionResult,
	NameInjection,
	ActionId,
	ActionMapping,
	ParseAccumulator,
} from "./src/common";

import * as common from "./src/common";

export const actionNameSet = common.actionNameSet;
export const actionOverloads = common.actionOverloads;
export const actionsBinaryToName = common.actionsBinaryToName;
export const actionsNameToBinary = common.actionsNameToBinary;
export const registerNameToBinary = common.registerNameToBinary;
export const registerBinaryToName = common.registerBinaryToName;

export const compile = _compile;
export const init = _init;
export const parse = _parse;
export const inject = _inject;
export const run = _run;

export type {
	CompileError,
	VM,
	CompiledMemory,
	InstructionResult,
	NameInjection,
	ActionId,
	ActionMapping,
	ParseAccumulator,
};
