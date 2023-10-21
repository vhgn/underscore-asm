import { InstructionResult, VM, actionsBinaryToName, registerNameToBinary } from "./common";

export function run(vm: VM): InstructionResult {
	const { memory, registers } = vm;
	const instruction = registers[registerNameToBinary.ip!]
	const instructionAction = memory[instruction]
	const action = actionsBinaryToName[instructionAction]

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

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "move_reg_dreg": {
			const destinationRegister = memory[instruction + 1]
			const sourceDereferencedRegister = memory[instruction + 2]
			const sourceAddress = registers[sourceDereferencedRegister]

			registers[destinationRegister] = memory[sourceAddress]

			registers[registerNameToBinary.ip!] += 3

			return { registerDereferencedRead: sourceDereferencedRegister, registerModified: destinationRegister }
		}

		case "move_dreg_reg": {
			const destinationDereferencedRegister = memory[instruction + 1]
			const destinationAddress = registers[destinationDereferencedRegister]
			const sourceRegister = memory[instruction + 2]

			memory[destinationAddress] = registers[sourceRegister]

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerDereferencedModified: destinationDereferencedRegister }
		}

		case "move_dreg_dreg": {
			const destinationDereferencedRegister = memory[instruction + 1]
			const destinationAddress = registers[destinationDereferencedRegister]
			const sourceDereferencedRegister = memory[instruction + 2]
			const sourceAddress = registers[sourceDereferencedRegister]

			memory[destinationAddress] = memory[sourceAddress]

			registers[registerNameToBinary.ip!] += 3

			return { registerDereferencedRead: sourceDereferencedRegister, registerDereferencedModified: destinationDereferencedRegister }
		}

		case "move_reg_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] = literal

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "move_dreg_lit": {
			const destinationDereferencedRegister = memory[instruction + 1]
			const destinationAddress = registers[destinationDereferencedRegister]
			const literal = memory[instruction + 2]

			memory[destinationAddress] = literal

			registers[registerNameToBinary.ip!] += 3

			return { registerDereferencedModified: destinationDereferencedRegister }
		}

		case "add_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] += registers[sourceRegister]

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "add_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] += literal

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "mul_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] *= registers[sourceRegister]

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "mul_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] *= literal

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "div_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] = Math.floor(registers[destinationRegister] / registers[sourceRegister])

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "div_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] = Math.floor(registers[destinationRegister] / literal)

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "neg": {
			const destinationRegister = memory[instruction + 1]

			registers[destinationRegister] = -registers[destinationRegister]

			registers[registerNameToBinary.ip!] += 2

			return { registerModified: destinationRegister }
		}

		case "mod_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] %= registers[sourceRegister]

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "mod_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] %= literal

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "not": {
			const destinationRegister = memory[instruction + 1]

			registers[destinationRegister] = ~registers[destinationRegister]

			registers[registerNameToBinary.ip!] += 2

			return { registerModified: destinationRegister }
		}

		case "and_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] &= registers[sourceRegister]

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "and_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] &= literal

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "or_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] |= registers[sourceRegister]

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "or_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] |= literal

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "xor_reg": {
			const destinationRegister = memory[instruction + 1]
			const sourceRegister = memory[instruction + 2]

			registers[destinationRegister] ^= registers[sourceRegister]

			registers[registerNameToBinary.ip!] += 3

			return { registerRead: sourceRegister, registerModified: destinationRegister }
		}

		case "xor_lit": {
			const destinationRegister = memory[instruction + 1]
			const literal = memory[instruction + 2]

			registers[destinationRegister] ^= literal

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: destinationRegister }
		}

		case "cmp_reg_reg": {
			const leftRegister = memory[instruction + 1]
			const rightRegister = memory[instruction + 2]

			const left = registers[leftRegister]
			const right = registers[rightRegister]
			registers[registerNameToBinary.cr!] = left - right;

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: registerNameToBinary.cr! }
		}

		case "cmp_reg_lit": {
			const leftRegister = memory[instruction + 1]
			const left = registers[leftRegister]

			const right = memory[instruction + 2]

			registers[registerNameToBinary.cr!] = left - right;

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: registerNameToBinary.cr! }
		}

		case "cmp_lit_reg": {
			const left = memory[instruction + 1]

			const rightRegister = memory[instruction + 2]
			const right = registers[rightRegister]

			registers[registerNameToBinary.cr!] = left - right;

			registers[registerNameToBinary.ip!] += 3

			return { registerModified: registerNameToBinary.cr! }
		}

		case "jumplt": {
			const label = memory[instruction + 1]

			if (registers[registerNameToBinary.cr!] < 0) {
				registers[registerNameToBinary.ip!] = label
			} else {
				registers[registerNameToBinary.ip!] += 2
			}

			return { registerRead: registerNameToBinary.cr! }
		}

		case "jumple": {
			const label = memory[instruction + 1]

			if (registers[registerNameToBinary.cr!] <= 0) {
				registers[registerNameToBinary.ip!] = label
			} else {
				registers[registerNameToBinary.ip!] += 2
			}

			return { registerRead: registerNameToBinary.cr! }
		}

		case "jumpeq": {
			const label = memory[instruction + 1]

			if (registers[registerNameToBinary.cr!] === 0) {
				registers[registerNameToBinary.ip!] = label
			} else {
				registers[registerNameToBinary.ip!] += 2
			}

			return { registerRead: registerNameToBinary.cr! }
		}

		case "jumpne": {
			const label = memory[instruction + 1]

			if (registers[registerNameToBinary.cr!] !== 0) {
				registers[registerNameToBinary.ip!] = label
			} else {
				registers[registerNameToBinary.ip!] += 2
			}

			return { registerRead: registerNameToBinary.cr! }
		}

		case "jumpgt": {
			const label = memory[instruction + 1]

			if (registers[registerNameToBinary.cr!] > 0) {
				registers[registerNameToBinary.ip!] = label
			} else {
				registers[registerNameToBinary.ip!] += 2
			}

			return { registerRead: registerNameToBinary.cr! }
		}

		case "jumpge": {
			const label = memory[instruction + 1]

			if (registers[registerNameToBinary.cr!] >= 0) {
				registers[registerNameToBinary.ip!] = label
			} else {
				registers[registerNameToBinary.ip!] += 2
			}

			return { registerRead: registerNameToBinary.cr! }
		}

		case "jump": {
			const label = memory[instruction + 1]

			registers[registerNameToBinary.ip!] = label

			return {}
		}

		case "push_reg": {
			const register = memory[instruction + 1]
			const value = registers[register]

			memory[registers[registerNameToBinary.sp!]] = value

			registers[registerNameToBinary.sp!] += 1

			registers[registerNameToBinary.ip!] += 2

			return { registerRead: register }
		}

		case "push_lit": {
			const literal = memory[instruction + 1]

			memory[registers[registerNameToBinary.sp!]] = literal

			registers[registerNameToBinary.sp!] += 1

			registers[registerNameToBinary.ip!] += 2

			return {}
		}

		case "pop_reg": {
			const register = memory[instruction + 1]

			registers[registerNameToBinary.sp!] -= 1

			const value = memory[registers[registerNameToBinary.sp!]]

			registers[register] = value

			registers[registerNameToBinary.ip!] += 2

			return { registerModified: register }
		}

		case "call": {
			const procedure = memory[instruction + 1]

			memory[registers[registerNameToBinary.sp!]] = registers[registerNameToBinary.ip!] + 2

			registers[registerNameToBinary.sp!] += 1

			registers[registerNameToBinary.ip!] = procedure

			return {}
		}

		case "ret": {
			registers[registerNameToBinary.sp!] -= 1

			const address = memory[registers[registerNameToBinary.sp!]]

			registers[registerNameToBinary.ip!] = address

			return {}
		}
	}
}
