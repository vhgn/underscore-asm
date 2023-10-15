import { Result, err, ok } from "variants-ts";
import { Action, CompileError, Parser, Token, actions, overloads } from "./common";

export function parse(parser: Parser, tokens: Token[], line: number): Parser {
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
				parser.pointer++;
				break;

			case "label":
				parser.labelInjections.push({ address: parser.pointer, label: token.data, line });
				parser.pointer++;
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

export function inject(parser: Parser): Result<boolean, CompileError[]> {
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
