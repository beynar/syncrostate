import { describe, it, expect } from 'vitest';

describe('init function', () => {
	it('should match array paths', () => {
		const paths = [
			'array.2.object',
			'array.1.object',
			'object.key.value',
			'object.array.4.value',
			'object.array.4'
		];

		function matchArrayPaths(paths: IterableIterator<string>, basePath?: string) {
			const basePathPattern = basePath ? `^${basePath}\\.` : '';
			const pathPatternRegex = new RegExp(`${basePathPattern}.*\\d+(?:\\.|$)`);
			const matches: string[] = [];

			for (const path of paths) {
				if (pathPatternRegex.test(path)) {
					matches.push(path);
				}
			}

			return matches;
		}

		const map = new Map<string, string>();
		paths.forEach((p) => map.set(p, p));
		const keys = matchArrayPaths(map.keys());

		// Test without base path
		expect(keys).toEqual([
			'array.2.object',
			'array.1.object',
			'object.array.4.value',
			'object.array.4'
		]);

		// Test with base path
		expect(matchArrayPaths(map.keys(), 'object.array')).toEqual([
			'object.array.4.value',
			'object.array.4'
		]);

		expect(matchArrayPaths(map.keys(), 'array')).toEqual(['array.2.object', 'array.1.object']);
	});
});
