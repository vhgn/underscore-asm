import { Result, err, iserr, isok, ok } from "variants-ts"
import { CompileError, CompiledMemory, VM, registerNameToBinary } from "./common"
import { tokenize } from "./tokenize"
import { inject, parse } from "./parse"

export function compile(code: string): Result<CompiledMemory, CompileError[]> {
	const tokenized = code
		.split("\n")
		.map((x) => x.trim())
		.map(tokenize)

	const errors = tokenized.filter(iserr)
	if (errors.length > 0) {
		return err(errors.flatMap((x) => x.data))
	}

	const tokens = tokenized.filter(isok).map((x) => x.data)

	const parser = tokens.reduce(parse, {
		labelInjections: [],
		labelAddresses: {},
		procedureInjections: [],
		procedureAddresses: {},
		sourceMaps: new Map(),
		pointer: 0,
		memory: new Uint16Array(1024),
		errors: [],
	})

	if (parser.errors.length > 0) {
		return err(parser.errors)
	}

	const result = inject(parser)

	if (iserr(result)) {
		return result
	}

	return ok({
		memory: parser.memory,
		entrypoint: parser.procedureAddresses["main"] ?? 0,
		size: parser.pointer,
		maps: parser.sourceMaps,
	})
}
export function init(compiled: CompiledMemory): VM {
	const { memory, size, entrypoint, maps } = compiled;
	const registerSize = Object.keys(registerNameToBinary).length
	const registers = new Uint16Array(registerSize)

	registers[registerNameToBinary.ip!] = entrypoint
	registers[registerNameToBinary.sp!] = size

	return { memory, registers, maps }
}

