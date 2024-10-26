import type { Primitive } from './types.js';

export const isPrimitive = (value: any): value is Primitive => {
	return (
		['string', 'number', 'date', 'boolean'].includes(value) ||
		(value.startsWith?.('<') && value.endsWith?.('>'))
	);
};
