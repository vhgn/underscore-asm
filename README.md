# underscore-asm

This is a compiler and interpreted runtime for Assembly language.

The main purpose was to build a simple language for people who want to learn
fundamentals of computer science.

# References

`halt` - stops the execution of the program (no arguments)

`move` - moves data to register/dereferenced register from register/literal/dereferenced register

`add` - adds to register from register/literal
`mul` - multiplies to register from register/literal (integers)
`div` - divides register in place to register/literal (integers)
`neg` - negates the value of a register in place
`mod` - puts the modulo register value/literal of a register in place

`not` - applies bitwise NOT to register
`and` - applies bitwise AND to register and register/literal
`or` - applies bitwise OR to register and register/literal
`xor` - applies bitwise XOR to register and register/literal

`cmp` - compares register content with a literal to be used in a jump

`jumplt` - jump to label if compare result is less than
`jumple` - jump to label if compare result is less than equal
`jumpeq` - jump to label if compare result is equal
`jumpne` - jump to label if compare result is not equal
`jumpgt` - jump to label if compare result is greater than
`jumpge` - jump to label if compare result is greater than equal

`push` - push a register or a literal to a stack
`pop` - pop the stack into a register

`call` - call a procedure
`ret` - return from a procedure

`!` - define a label
`@` - use a label
`>` - defined a procedure
`<` - use a procedure

# Examples

> Coming soon
