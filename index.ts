import { compile } from "./src/compile";
import { parse } from "./src/parse";
import { run } from "./src/run";

import type {
	CompileError,
	VM,
	Compiled,
} from "./src/common";

export type {
	CompileError,
	VM,
	Compiled,
};

export default {
	compile,
	parse,
	run,
};


