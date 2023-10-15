import { expect, test } from "bun:test";
import { compile, actions, registers } from ".";
import { iserr } from "variants-ts";

test("should compile `move`", () => {
	const result = compile("move r0 r1");
	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data[0]).toBe(actions.move_reg_reg);
	expect(result.data[1]).toBe(registers.r0);
	expect(result.data[2]).toBe(registers.r1);
});

test("should compile `move` with literal", () => {
	const result = compile("move r0 101");
	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data[0]).toEqual(actions.move_reg_lit);
	expect(result.data[1]).toEqual(registers.r0);
	expect(result.data[2]).toEqual(5);
});

test("should compile `move` with dereference", () => {
	const result = compile("move r0 *r1");
	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data[0]).toEqual(actions.move_reg_dreg);
	expect(result.data[1]).toEqual(registers.r0);
	expect(result.data[2]).toEqual(registers.r1);
});

test("should compile example 1", () => {
	const result = compile(`
		move r0 11
		move r1 10
		add r0 r1
	`);
	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data[0]).toEqual(actions.move_reg_lit);
	expect(result.data[1]).toEqual(registers.r0);
	expect(result.data[2]).toEqual(3);

	expect(result.data[3]).toEqual(actions.move_reg_lit);
	expect(result.data[4]).toEqual(registers.r1);
	expect(result.data[5]).toEqual(2);

	expect(result.data[6]).toEqual(actions.add_reg);
	expect(result.data[7]).toEqual(registers.r0);
	expect(result.data[8]).toEqual(registers.r1);
});

test("should compile example 2", () => {
	const result = compile(`
	   # Define a start label
		!start

		# Initialize variables
		move r1 101
		move r2 1

		# Loop to calculate factorial
		!loop
			mul r2 r1
			add r1 1111111111111111
			cmp r1 0
			jumpeq @end
			jump @loop

		# Print the result
		!end
			push r2
			call <print
			pop r2

		# Halt the program
		halt

		# Define a print procedure
		>print
			pop r1
			move r3 r1
			move r4 0

			# Loop to print each digit
			!print_loop
				div r3 1010
				mod r3 1010
				add r2 110000
				push r2
				add r4 1
				cmp r3 0
				jumpeq @print_end
				jump @print_loop

			# Print the digits from the stack
			!print_end
				cmp r4 0
				jumpeq @print_done
				add r4 1111111111111111
				pop r2
				# Print the ASCII digit (you can implement this part)
				jump @print_end

			# End of print procedure
			!print_done
				ret
	`);

	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data[0]).toEqual(actions.move_reg_lit);
	expect(result.data[1]).toEqual(registers.r1);
	expect(result.data[2]).toEqual(5);

	expect(result.data[3]).toEqual(actions.move_reg_lit);
	expect(result.data[4]).toEqual(registers.r2);
	expect(result.data[5]).toEqual(1);


});
