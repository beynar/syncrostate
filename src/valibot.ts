import { object, string, number, array, optional } from 'valibot';

const schema = object({
	name: string(),
	age: optional(number()),
	friends: array(object({ name: string() })),
	address: optional(object({ street: string() }))
});

const data = {
	name: 'John'
};

console.dir(schema, { depth: null });
