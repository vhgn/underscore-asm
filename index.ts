import { ok, isok, iserr, variant, type Result, type Variant, err } from "variants-ts";

export const actions = {
	halt: 0b0000_0000_0000_0000,

	move_reg_reg: 0b0000_0000_0000_0001,
	move_reg_dreg: 0b0000_0000_0000_0010,
	move_dreg_reg: 0b0000_0000_0000_0011,
	move_dreg_dreg: 0b0000_0000_0000_0100,
	move_reg_lit: 0b0000_0000_0000_0101,
	move_dreg_lit: 0b0000_0000_0000_0110,

	add_reg: 0b0000_0000_0000_0111,
	add_lit: 0b0000_0000_0000_1000,
	mul_reg: 0b0000_0000_0000_1001,
	mul_lit: 0b0000_0000_0000_1010,
	div_reg: 0b0000_0000_0000_1011,
	div_lit: 0b0000_0000_0000_1100,
	neg: 0b0000_0000_0000_1101,
	mod_reg: 0b0000_0000_0000_1110,
	mod_lit: 0b0000_0000_0000_1111,

	not: 0b0000_0000_0001_0000,
	and_reg: 0b0000_0000_0001_0001,
	and_lit: 0b0000_0000_0001_0010,
	or_reg: 0b0000_0000_0001_0011,
	or_lit: 0b0000_0000_0001_0100,
	xor_reg: 0b0000_0000_0001_0101,
	xor_lit: 0b0000_0000_0001_0110,

	cmp_reg_reg: 0b0000_0000_0001_0111,
	cmp_reg_lit: 0b0000_0000_0001_1000,
	cmp_lit_reg: 0b0000_0000_0001_1001,

	jumplt: 0b0000_0000_0001_1010,
	jumple: 0b0000_0000_0001_1011,
	jumpeq: 0b0000_0000_0001_1100,
	jumpne: 0b0000_0000_0001_1101,
	jumpgt: 0b0000_0000_0001_1110,
	jumpge: 0b0000_0000_0001_1111,

	push_reg: 0b0000_0000_0010_0000,
	push_lit: 0b0000_0000_0010_0001,
	pop_reg: 0b0000_0000_0010_0010,

	call: 0b0000_0000_0010_0011,
	ret: 0b0000_0000_0010_0100,
	jump: 0b0000_0000_0010_0101,
};

type Action = keyof typeof actions;
export const actionsReversed: Record<number, Action | undefined> = {
	0b0000_0000_0000_0000: "halt",

	0b0000_0000_0000_0001: "move_reg_reg",
	0b0000_0000_0000_0010: "move_reg_dreg",
	0b0000_0000_0000_0011: "move_dreg_reg",
	0b0000_0000_0000_0100: "move_dreg_dreg",
	0b0000_0000_0000_0101: "move_reg_lit",
	0b0000_0000_0000_0110: "move_dreg_lit",

	0b0000_0000_0000_0111: "add_reg",
	0b0000_0000_0000_1000: "add_lit",
	0b0000_0000_0000_1001: "mul_reg",
	0b0000_0000_0000_1010: "mul_lit",
	0b0000_0000_0000_1011: "div_reg",
	0b0000_0000_0000_1100: "div_lit",
	0b0000_0000_0000_1101: "neg",
	0b0000_0000_0000_1110: "mod_reg",
	0b0000_0000_0000_1111: "mod_lit",

	0b0000_0000_0001_0000: "not",
	0b0000_0000_0001_0001: "and_reg",
	0b0000_0000_0001_0010: "and_lit",
	0b0000_0000_0001_0011: "or_reg",
	0b0000_0000_0001_0100: "or_lit",
	0b0000_0000_0001_0101: "xor_reg",
	0b0000_0000_0001_0110: "xor_lit",

	0b0000_0000_0001_0111: "cmp_reg_reg",
	0b0000_0000_0001_1000: "cmp_reg_lit",
	0b0000_0000_0001_1001: "cmp_lit_reg",

	0b0000_0000_0001_1010: "jumplt",
	0b0000_0000_0001_1011: "jumple",
	0b0000_0000_0001_1100: "jumpeq",
	0b0000_0000_0001_1101: "jumpne",
	0b0000_0000_0001_1110: "jumpgt",
	0b0000_0000_0001_1111: "jumpge",

	0b0000_0000_0010_0000: "push_reg",
	0b0000_0000_0010_0001: "push_lit",
	0b0000_0000_0010_0010: "pop_reg",

	0b0000_0000_0010_0011: "call",
	0b0000_0000_0010_0100: "ret",
	0b0000_0000_0010_0101: "jump",
};

interface Mapping {
	action: string;
	payload: Token["type"][];
	code: string;
}

const overloads: Mapping[] = [
	{ action: "halt", payload: [], code: "halt" },

	{ action: "move", payload: ["register", "register"], code: "move_reg_reg" },
	{ action: "move", payload: ["register", "dereferenced"], code: "move_reg_dreg" },
	{ action: "move", payload: ["dereferenced", "register"], code: "move_dreg_reg" },
	{ action: "move", payload: ["dereferenced", "dereferenced"], code: "move_dreg_dreg" },
	{ action: "move", payload: ["register", "literal"], code: "move_reg_lit" },
	{ action: "move", payload: ["dereferenced", "literal"], code: "move_dreg_lit" },

	{ action: "add", payload: ["register", "register"], code: "add_reg" },
	{ action: "add", payload: ["register", "literal"], code: "add_lit" },
	{ action: "mul", payload: ["register", "register"], code: "mul_reg" },
	{ action: "mul", payload: ["register", "literal"], code: "mul_lit" },
	{ action: "div", payload: ["register", "register"], code: "div_reg" },
	{ action: "div", payload: ["register", "literal"], code: "div_lit" },
	{ action: "neg", payload: ["register"], code: "neg" },
	{ action: "mod", payload: ["register", "register"], code: "mod_reg" },
	{ action: "mod", payload: ["register", "literal"], code: "mod_lit" },

	{ action: "not", payload: ["register"], code: "not" },
	{ action: "and", payload: ["register", "register"], code: "and_reg" },
	{ action: "and", payload: ["register", "literal"], code: "and_lit" },
	{ action: "or", payload: ["register", "register"], code: "or_reg" },
	{ action: "or", payload: ["register", "literal"], code: "or_lit" },
	{ action: "xor", payload: ["register", "register"], code: "xor_reg" },
	{ action: "xor", payload: ["register", "literal"], code: "xor_lit" },

	{ action: "cmp", payload: ["register", "register"], code: "cmp_reg_reg" },
	{ action: "cmp", payload: ["register", "literal"], code: "cmp_reg_lit" },
	{ action: "cmp", payload: ["literal", "register"], code: "cmp_lit_reg" },

	{ action: "jumplt", payload: ["label"], code: "jumplt" },
	{ action: "jumple", payload: ["label"], code: "jumple" },
	{ action: "jumpeq", payload: ["label"], code: "jumpeq" },
	{ action: "jumpne", payload: ["label"], code: "jumpne" },
	{ action: "jumpgt", payload: ["label"], code: "jumpgt" },
	{ action: "jumpge", payload: ["label"], code: "jumpge" },
	{ action: "jump", payload: ["label"], code: "jump" },

	{ action: "push", payload: ["register"], code: "push_reg" },
	{ action: "push", payload: ["literal"], code: "push_lit" },
	{ action: "pop", payload: ["register"], code: "pop_reg" },

	{ action: "call", payload: ["procedure"], code: "call" },
	{ action: "ret", payload: [], code: "ret" },
];

const actionNames = overloads.reduce((acc, x) => acc.add(x.action), new Set<string>());

export const registersMap: Record<string, number | undefined> = {
	r0: 0b0000_0000_0000_0000,
	r1: 0b0000_0000_0000_0001,
	r2: 0b0000_0000_0000_0010,
	r3: 0b0000_0000_0000_0011,
	r4: 0b0000_0000_0000_0100,
	r5: 0b0000_0000_0000_0101,
	r6: 0b0000_0000_0000_0110,
	r7: 0b0000_0000_0000_0111,
	ip: 0b0000_0000_0000_1000,
	sp: 0b0000_0000_0000_1001,
	cr: 0b0000_0000_0000_1011,
};

type Token =
	| Variant<"label", string>
	| Variant<"procedure", string>
	| Variant<"register", number>
	| Variant<"dereferenced", number>
	| Variant<"literal", number>
	| Variant<"action", string>
	| Variant<"label_definition", string>
	| Variant<"procedure_definition", string>;

interface Injection {
	address: number;
	label: string;
	line: number;
}

interface CompileError {
	line: number;
	message: string;
}

interface Parser {
	labelInjections: Injection[];
	labelAddresses: Record<string, number | undefined>;
	procedureInjections: Injection[];
	procedureAddresses: Record<string, number | undefined>;
	pointer: number;
	memory: Uint16Array;
	errors: CompileError[];
}

function parse(parser: Parser, tokens: Token[], line: number): Parser {
	if (tokens.length === 0) {
		return parser;
	}

	const [first, ...rest] = tokens;
	if (first.type === "label_definition") {
		if (parser.labelAddresses[first.data] !== undefined) {
			parser.errors.push({ line, message: `Duplicate label ${first.data}` });
		}

		if (tokens.length !== 1) {
			parser.errors.push({ line, message: `Label ${first.data} must be on its own line` });
		}

		parser.labelAddresses[first.data] = parser.pointer;
		return parser;
	}

	if (first.type === "procedure_definition") {
		if (parser.procedureAddresses[first.data] !== undefined) {
			parser.errors.push({ line, message: `Duplicate procedure ${first.data}` });
		}

		if (tokens.length !== 1) {
			parser.errors.push({ line, message: `Procedure ${first.data} must be on its own line` });
		}

		parser.procedureAddresses[first.data] = parser.pointer;
		return parser;
	}

	const mapping = overloads.find((m) => {
		if (m.action !== first.data) {
			return false;
		}

		if (m.payload.length !== rest.length) {
			return false;
		}

		if (m.payload.some((p, i) => p !== rest[i].type)) {
			return false;
		}

		return true;
	});

	if (mapping === undefined) {
		parser.errors.push({ line, message: `Invalid instruction ${first.type}` });
		return parser;
	}

	const actionCode = actions[mapping.code as Action];
	if (actionCode === undefined) {
		throw new Error(`Unknown action code ${mapping.code}`);
	}

	parser.memory[parser.pointer] = actionCode;
	parser.pointer++;

	for (const token of rest) {
		switch (token.type) {
			case "procedure":
				parser.procedureInjections.push({ address: parser.pointer, label: token.data, line });
				break;

			case "label":
				parser.labelInjections.push({ address: parser.pointer, label: token.data, line });
				break;

			case "register":
			case "dereferenced":
			case "literal":
				parser.memory[parser.pointer] = token.data;
				parser.pointer++;
				break;
		}

	}

	return parser;
}

function inject(parser: Parser): Result<boolean, CompileError[]> {
	const errors = [];
	for (const { address, label, line } of parser.labelInjections) {
		const labelAddress = parser.labelAddresses[label];
		if (labelAddress === undefined) {
			errors.push({ line, message: `Unknown label ${label}` });
			continue;
		}

		parser.memory[address] = labelAddress;
	}

	for (const { address, label, line } of parser.procedureInjections) {
		const labelAddress = parser.procedureAddresses[label];
		if (labelAddress === undefined) {
			errors.push({ line, message: `Unknown procedure ${label}` });
			continue;
		}

		parser.memory[address] = labelAddress;
	}

	if (errors.length > 0) {
		return err(errors);
	}

	return ok(true);
}

const LABEL_DEFINE = "!";
const PROCEDURE_DEFINE = ">";
const LABEL_USE = "@";
const PROCEDURE_USE = "<";

function tokenize(content: string, line: number): Result<Token[], CompileError[]> {
	const isEmpty = content.length === 0
	if (isEmpty) {
		const noop: Token[] = [];
		return ok(noop)
	}

	const isComment = content.trim().startsWith("#")
	if (isComment) {
		const noop: Token[] = [];
		return ok(noop)
	}

	const tokenized = content.split(" ").map((word): Result<Token, CompileError> => {
		const isAction = actionNames.has(word)
		if (isAction) {
			return ok(variant("action", word))
		}

		const registerCode = registersMap[word]
		if (registerCode !== undefined) {
			return ok(variant("register", registerCode))
		}

		const isDereferenced = word.startsWith("*")
		if (isDereferenced) {
			const registerCode = registersMap[word.slice(1)]

			if (registerCode === undefined) {
				return err({ line, message: "Dereferencing not a register" })
			}

			return ok(variant("dereferenced", registerCode))
		}

		const isLabelDefinition = word.startsWith(LABEL_DEFINE)
		if (isLabelDefinition) {
			return ok(variant("label_definition", word.slice(1)))
		}

		const isProcedureDefinition = word.startsWith(PROCEDURE_DEFINE)
		if (isProcedureDefinition) {
			return ok(variant("procedure_definition", word.slice(1)))
		}

		const isLabel = word.startsWith(LABEL_USE)
		if (isLabel) {
			return ok(variant("label", word.slice(1)))
		}

		const isProcedure = word.startsWith(PROCEDURE_USE)
		if (isProcedure) {
			return ok(variant("procedure", word.slice(1)))
		}

		const isLiteral = word.startsWith("0") || word.startsWith("1")
		if (isLiteral) {
			if (word.length > 16) {
				return err({ line, message: `Expected a 16-bit binary number, got ${word.length} bits` })
			}

			const value = parseInt(word, 2)

			if (isNaN(value)) {
				return err({ line, message: "Expected a binary number" })
			}

			return ok({ type: "literal", data: value })
		}

		return err({ line, message: `Unknown token ${word}` })
	})

	const errors = tokenized.filter(iserr)

	if (errors.length > 0) {
		return err(errors.map((x) => x.data));
	}

	return ok(tokenized.filter(isok).map((x) => x.data));
}

export function compile(code: string): Result<Uint16Array, CompileError[]> {
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

	return ok(parser.memory)
}

export interface InstructionResult {
	registerRead?: number;
	registerModified?: number;
	registerDereferencedRead?: number;
	registerDereferencedModified?: number;
	shouldHalt?: boolean;
}

/// TODO: initialize registers, stack grows up
export function run(memory: Uint16Array, registers: Uint16Array): InstructionResult {
	const instruction = registers[registersMap.ip!]
	const action = actionsReversed[instruction]

	if (action === undefined) {
		throw new Error(`Unknown instruction ${instruction}`)
	}

	switch (action) {
		case "halt": {
			return { shouldHalt: true }
		}

		case "move_reg_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] = registers[sourceRegister]

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "move_reg_dreg": {
			const destinationRegister = memory[instruction + 1]
			const sourceDereferencedRegister = memory[instruction + 2]
			const sourceAddress = registers[sourceDereferencedRegister]

			registers[destinationRegister] = memory[sourceAddress]

			registers[registersMap.ip!] += 3

			return { registerDereferencedRead: sourceDereferencedRegister, registerModified: destinationRegister }
		}

		case "move_dreg_reg": {
			const destinationDereferencedRegister = memory[instruction + 1]
			const destinationAddress = registers[destinationDereferencedRegister]
			const sourceRegister = memory[instruction + 2]

			memory[destinationAddress] = registers[sourceRegister]

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerDereferencedModified: destinationDereferencedRegister }
		}

		case "move_dreg_dreg": {
			const destinationDereferencedRegister = memory[instruction + 1]
			const destinationAddress = registers[destinationDereferencedRegister]
			const sourceDereferencedRegister = memory[instruction + 2]
			const sourceAddress = registers[sourceDereferencedRegister]

			memory[destinationAddress] = memory[sourceAddress]

			registers[registersMap.ip!] += 3

			return { registerDereferencedRead: sourceDereferencedRegister, registerDereferencedModified: destinationDereferencedRegister }
		}

		case "move_reg_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] = literal

			registers[registersMap.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "move_dreg_lit": {
			const destinationDereferencedRegister = memory[instruction + 1]
			const destinationAddress = registers[destinationDereferencedRegister]
			const literal = memory[instruction + 2]

			memory[destinationAddress] = literal

			registers[registersMap.ip!] += 3

			return { registerDereferencedModified: destinationDereferencedRegister }
		}

		case "add_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] += registers[sourceRegister]

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "add_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] += literal

			registers[registersMap.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "mul_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] *= registers[sourceRegister]

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "mul_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] *= literal

			registers[registersMap.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "div_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] = Math.floor(registers[destinationRegister] / registers[sourceRegister])

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "div_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] = Math.floor(registers[destinationRegister] / literal)

			registers[registersMap.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "neg": {
			const destinationRegister = memory[instruction + 1]
			
			registers[destinationRegister] = -registers[destinationRegister]

			registers[registersMap.ip!] += 2

			return { registerModified: destinationRegister }
		}

		case "mod_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] %= registers[sourceRegister]

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "mod_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] %= literal

			registers[registersMap.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "not": {
			const destinationRegister = memory[instruction + 1]

			registers[destinationRegister] = ~registers[destinationRegister]

			registers[registersMap.ip!] += 2

			return { registerModified: destinationRegister }
		}

		case "and_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] &= registers[sourceRegister]

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "and_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] &= literal

			registers[registersMap.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "or_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] |= registers[sourceRegister]

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "or_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] |= literal

			registers[registersMap.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "xor_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] ^= registers[sourceRegister]

			registers[registersMap.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "xor_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] ^= literal

			registers[registersMap.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "cmp_reg_reg": {
			const leftRegister = memory[instruction + 1]
			const rightRegister = memory[instruction + 2]

			const left = registers[leftRegister]
			const right = registers[rightRegister]
			registers[registersMap.cr!] = left - right;

			registers[registersMap.ip!] += 3

			return { registerModified: registersMap.cr! }
		}

		case "cmp_reg_lit": {
			const leftRegister = memory[instruction + 1]
			const left = registers[leftRegister]

			const right = memory[instruction + 2]

			registers[registersMap.cr!] = left - right;

			registers[registersMap.ip!] += 3

			return { registerModified: registersMap.cr! }
		}

		case "cmp_lit_reg": {
			const left = memory[instruction + 1]

			const rightRegister = memory[instruction + 2]
			const right = registers[rightRegister]

			registers[registersMap.cr!] = left - right;
			
			registers[registersMap.ip!] += 3

			return { registerModified: registersMap.cr! }
		}

		case "jumplt": {
			const label = memory[instruction + 1]

			if (registers[registersMap.cr!] < 0) {
				registers[registersMap.ip!] = label
			} else {
				registers[registersMap.ip!] += 2
			}

			return { registerRead: registersMap.cr! }
		}

		case "jumple": {
			const label = memory[instruction + 1]

			if (registers[registersMap.cr!] <= 0) {
				registers[registersMap.ip!] = label
			} else {
				registers[registersMap.ip!] += 2
			}

			return { registerRead: registersMap.cr! }
		}

		case "jumpeq": {
			const label = memory[instruction + 1]

			if (registers[registersMap.cr!] === 0) {
				registers[registersMap.ip!] = label
			} else {
				registers[registersMap.ip!] += 2
			}

			return { registerRead: registersMap.cr! }
		}

		case "jumpne": {
			const label = memory[instruction + 1]

			if (registers[registersMap.cr!] !== 0) {
				registers[registersMap.ip!] = label
			} else {
				registers[registersMap.ip!] += 2
			}

			return { registerRead: registersMap.cr! }
		}

		case "jumpgt": {
			const label = memory[instruction + 1]

			if (registers[registersMap.cr!] > 0) {
				registers[registersMap.ip!] = label
			} else {
				registers[registersMap.ip!] += 2
			}

			return { registerRead: registersMap.cr! }
		}

		case "jumpge": {
			const label = memory[instruction + 1]

			if (registers[registersMap.cr!] >= 0) {
				registers[registersMap.ip!] = label
			} else {
				registers[registersMap.ip!] += 2
			}

			return { registerRead: registersMap.cr! }
		}

		case "jump": {
			const label = memory[instruction + 1]

			registers[registersMap.ip!] = label

			return {}
		}

		case "push_reg": {
			const register = memory[instruction + 1]
			const value = registers[register]

			memory[registers[registersMap.sp!]] = value

			registers[registersMap.sp!] += 1

			registers[registersMap.ip!] += 2

			return { registerRead: register }
		}

		case "push_lit": {
			const literal = memory[instruction + 1]

			memory[registers[registersMap.sp!]] = literal

			registers[registersMap.sp!] += 1

			registers[registersMap.ip!] += 2

			return {}
		}

		case "pop_reg": {
			const register = memory[instruction + 1]

			registers[registersMap.sp!] -= 1

			const value = memory[registers[registersMap.sp!]]

			registers[register] = value

			registers[registersMap.ip!] += 2

			return { registerModified: register }
		}

		case "call": {
			const procedure = memory[instruction + 1]

			memory[registers[registersMap.sp!]] = registers[registersMap.ip!] + 2

			registers[registersMap.sp!] += 1

			registers[registersMap.ip!] = procedure

			return {}
		}

		case "ret": {
			registers[registersMap.sp!] -= 1

			const address = memory[registers[registersMap.sp!]]

			registers[registersMap.ip!] = address

			return {}
		}
	}
}

