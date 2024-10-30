import { describe, it, expect } from 'vitest';

describe('init function', () => {
	it('should initialize a simple object schema correctly', () => {
		const proxy = new Proxy({} as any, {
			get(target, p) {
				return 'world';
			},
			getOwnPropertyDescriptor(target, p) {
				if (typeof p === 'string') {
					return {
						enumerable: true,
						configurable: true
					};
				}
				return undefined;
			},
			ownKeys: (target) => {
				console.log('ownKeys');
				return ['hello'];
			}
		});
		console.log(Object.values(proxy));
	});
});
