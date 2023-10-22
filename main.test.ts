import { expect, test } from "bun:test";
import { iserr } from "variants-ts";

import { actionsNameToBinary, registerNameToBinary } from "./src/common";
import { compile, init } from "./src/compile";
import { run } from "./src/run";

test("should compile `move`", () => {
	const result = compile("move r0 r1");
	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data.memory[0]).toBe(actionsNameToBinary.move_reg_reg);
	expect(result.data.memory[1]).toBe(registerNameToBinary.r0);
	expect(result.data.memory[2]).toBe(registerNameToBinary.r1);
});

test("should compile `move` with literal", () => {
	const result = compile("move r0 101");
	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data.memory[0]).toEqual(actionsNameToBinary.move_reg_lit);
	expect(result.data.memory[1]).toEqual(registerNameToBinary.r0);
	expect(result.data.memory[2]).toEqual(5);
});

test("should compile `move` with dereference", () => {
	const result = compile("move r0 *r1");
	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data.memory[0]).toEqual(actionsNameToBinary.move_reg_dreg);
	expect(result.data.memory[1]).toEqual(registerNameToBinary.r0);
	expect(result.data.memory[2]).toEqual(registerNameToBinary.r1);
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

	expect(result.data.memory[0]).toEqual(actionsNameToBinary.move_reg_lit);
	expect(result.data.memory[1]).toEqual(registerNameToBinary.r0);
	expect(result.data.memory[2]).toEqual(3);

	expect(result.data.memory[3]).toEqual(actionsNameToBinary.move_reg_lit);
	expect(result.data.memory[4]).toEqual(registerNameToBinary.r1);
	expect(result.data.memory[5]).toEqual(2);

	expect(result.data.memory[6]).toEqual(actionsNameToBinary.add_reg);
	expect(result.data.memory[7]).toEqual(registerNameToBinary.r0);
	expect(result.data.memory[8]).toEqual(registerNameToBinary.r1);
});

test("should compile example 2", () => {
	const result = compile(`
	   # Define a start label
		!main

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

	expect(result.data.memory[0]).toEqual(actionsNameToBinary.move_reg_lit);
	expect(result.data.memory[1]).toEqual(registerNameToBinary.r1);
	expect(result.data.memory[2]).toEqual(5);

	expect(result.data.memory[3]).toEqual(actionsNameToBinary.move_reg_lit);
	expect(result.data.memory[4]).toEqual(registerNameToBinary.r2);
	expect(result.data.memory[5]).toEqual(1);
});

test("should compile and run example3", () => {
	const result = compile(`
		# Define a start label
		!main
			move r0 0
			move r1 101
			move r2 1
		!loop
			add r1 r2
			cmp r1 1010
			jumpeq @end
			jump @loop
		!end
			halt
	`);

	if (iserr(result)) {
		throw new Error(JSON.stringify(result.data));
	}

	expect(result.data.memory[0]).toEqual(actionsNameToBinary.move_reg_lit);
	expect(result.data.memory[1]).toEqual(registerNameToBinary.r0);
	expect(result.data.memory[2]).toEqual(0);

	expect(result.data.memory[3]).toEqual(actionsNameToBinary.move_reg_lit);
	expect(result.data.memory[4]).toEqual(registerNameToBinary.r1);
	expect(result.data.memory[5]).toEqual(5);

	expect(result.data.memory[6]).toEqual(actionsNameToBinary.move_reg_lit);
	expect(result.data.memory[7]).toEqual(registerNameToBinary.r2);
	expect(result.data.memory[8]).toEqual(1);

	expect(result.data.memory[9]).toEqual(actionsNameToBinary.add_reg);
	expect(result.data.memory[10]).toEqual(registerNameToBinary.r1);
	expect(result.data.memory[11]).toEqual(registerNameToBinary.r2);

	expect(result.data.memory[12]).toEqual(actionsNameToBinary.cmp_reg_lit);
	expect(result.data.memory[13]).toEqual(registerNameToBinary.r1);
	expect(result.data.memory[14]).toEqual(10);

	expect(result.data.memory[15]).toEqual(actionsNameToBinary.jumpeq);
	expect(result.data.memory[16]).toEqual(19);

	expect(result.data.memory[17]).toEqual(actionsNameToBinary.jump);
	expect(result.data.memory[18]).toEqual(9);

	expect(result.data.memory[19]).toEqual(actionsNameToBinary.halt);

	const vm = init(result.data);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(0);

	let line;
	let ip;
	// move r0 0
	ip = vm.registers[registerNameToBinary.ip!];
	line = vm.maps.get(ip);
	expect(line).toEqual(4);

	run(vm);
	expect(vm.registers[registerNameToBinary.r0!]).toEqual(0);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(3);

	// move r1 101
	ip = vm.registers[registerNameToBinary.ip!];
	line = vm.maps.get(ip);
	expect(line).toEqual(5);

	run(vm);
	expect(vm.registers[registerNameToBinary.r1!]).toEqual(5);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(6);

	// move r2 1
	run(vm);
	expect(vm.registers[registerNameToBinary.r2!]).toEqual(1);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(9);

	// add r1 r2
	run(vm);
	expect(vm.registers[registerNameToBinary.r1!]).toEqual(6);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(12);

	// cmp r0 1010
	run(vm);
	expect(vm.registers[registerNameToBinary.r0!]).toEqual(0);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(15);

	// jumpeq @end (noop)
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(17);

	// jump @loop
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(9);

	// add r1 r2
	run(vm);
	expect(vm.registers[registerNameToBinary.r1!]).toEqual(7);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(12);

	// cmp r0 1010
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(15);

	// jumpeq @end (noop)
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(17);

	// jump @loop
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(9);

	// add r1 r2
	run(vm);
	expect(vm.registers[registerNameToBinary.r1!]).toEqual(8);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(12);

	// cmp r0 1010
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(15);

	// jumpeq @end (noop)
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(17);

	// jump @loop
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(9);

	// add r1 r2
	run(vm);
	expect(vm.registers[registerNameToBinary.r1!]).toEqual(9);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(12);

	// cmp r0 1010
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(15);

	// jumpeq @end (noop)
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(17);

	// jump @loop
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(9);

	// add r1 r2
	run(vm);
	expect(vm.registers[registerNameToBinary.r1!]).toEqual(10);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(12);

	// cmp r1 1010
	run(vm);
	expect(vm.registers[registerNameToBinary.cr!]).toEqual(0);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(15);

	// jumpeq @end
	ip = vm.registers[registerNameToBinary.ip!];
	line = vm.maps.get(ip);
	expect(line).toEqual(10);

	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(19);

	// halt
	const { shouldHalt } = run(vm);
	expect(shouldHalt).toEqual(true);
});

test("should overflow on add", () => {
	const compiled = compile(`
		move r0 1
		move r1 1111111111111111
		add r0 r1
	`);

	if (iserr(compiled)) {
		throw new Error(JSON.stringify(compiled.data));
	}

	const vm = init(compiled.data);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(0);

	run(vm);
	run(vm);
	run(vm);

	expect(vm.registers[registerNameToBinary.r0!]).toEqual(0);
	expect(vm.registers[registerNameToBinary.cr!]).toEqual(1);
});

test("should jumpge on equal", () => {
	const compiled = compile(`
		!loop
		move r0 1
		move r1 1111111111111111
		add r0 r1
		cmp r0 0
		jumpge @end
		jump @loop
		!end
		halt
	`);

	if (iserr(compiled)) {
		throw new Error(JSON.stringify(compiled.data));
	}

	const vm = init(compiled.data);

	// move r0 1
	run(vm);

	// move r1 1111111111111111
	run(vm);

	// add r0 r1
	run(vm);

	// cmp r0 0
	run(vm);
	expect(vm.registers[registerNameToBinary.cr!]).toEqual(0);

	// jumpge @end
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(16);

	run(vm);
	run(vm);
});


test("should jumpge on greater", () => {
	const compiled = compile(`
		!loop
		move r0 1010
		move r1 11111
		add r0 r1
		cmp r0 10
		jumpge @end
		jump @loop
		!end
		halt
	`);

	if (iserr(compiled)) {
		throw new Error(JSON.stringify(compiled.data));
	}

	const vm = init(compiled.data);

	// move r0 1010
	run(vm);

	// move r1 11111
	run(vm);

	// add r0 r1
	run(vm);

	// cmp r0 10
	run(vm);
	expect(vm.registers[registerNameToBinary.cr!]).toBeGreaterThan(0);

	// jumpge @end
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(16);

	run(vm);
	run(vm);
});

test("should not jumpge on less", () => {
	const compiled = compile(`
		!loop
		move r0 1010
		move r1 11111
		add r0 r1
		cmp r0 1111111
		jumpge @end
		jump @loop
		!end
		halt
	`);

	if (iserr(compiled)) {
		throw new Error(JSON.stringify(compiled.data));
	}

	const vm = init(compiled.data);

	// move r0 1010
	run(vm);

	// move r1 11111
	run(vm);

	// add r0 r1
	run(vm);

	// cmp r0 10
	run(vm);
	expect(vm.registers[registerNameToBinary.cr!]).toEqual(0b1111_1111_1111_1111);

	// jumpge @end
	run(vm);
	expect(vm.registers[registerNameToBinary.ip!]).toEqual(14);

	run(vm);
	run(vm);
});

