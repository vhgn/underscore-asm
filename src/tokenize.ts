import { Result, err, iserr, isok, ok, variant } from "variants-ts";
import { CompileError, LABEL_DEFINE, LABEL_USE, PROCEDURE_DEFINE, PROCEDURE_USE, Token, actionNames, registersMap } from "./common";

export function tokenize(content: string, line: number): Result<Token[], CompileError[]> {
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
