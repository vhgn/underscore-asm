import { type Variant } from "variants-ts";

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

export type Action = keyof typeof actions;
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

export interface Mapping {
	action: string;
	payload: Token["type"][];
	code: string;
}

export const overloads: Mapping[] = [
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

export const actionNames = overloads.reduce((acc, x) => acc.add(x.action), new Set<string>());

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
	cr: 0b0000_0000_0000_1010,
};

export type Token =
	| Variant<"label", string>
	| Variant<"procedure", string>
	| Variant<"register", number>
	| Variant<"dereferenced", number>
	| Variant<"literal", number>
	| Variant<"action", string>
	| Variant<"label_definition", string>
	| Variant<"procedure_definition", string>;

export interface Injection {
	address: number;
	label: string;
	line: number;
}

export interface CompileError {
	line: number;
	message: string;
}

export interface Parser {
	labelInjections: Injection[];
	labelAddresses: Record<string, number | undefined>;
	procedureInjections: Injection[];
	procedureAddresses: Record<string, number | undefined>;
	sourceMaps: Map<number, number>;
	pointer: number;
	memory: Uint16Array;
	errors: CompileError[];
}
export interface InstructionResult {
	registerRead?: number;
	registerModified?: number;
	registerDereferencedRead?: number;
	registerDereferencedModified?: number;
	shouldHalt?: boolean;
}

export interface VM {
	memory: Uint16Array;
	registers: Uint16Array;
	maps: Map<number, number>;
}

export const LABEL_DEFINE = "!";
export const PROCEDURE_DEFINE = ">";
export const LABEL_USE = "@";
export const PROCEDURE_USE = "<";


export interface Compiled {
	memory: Uint16Array;
	entrypoint: number;
	maps: Map<number, number>;
	size: number;
}
