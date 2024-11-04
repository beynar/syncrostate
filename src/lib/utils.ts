import * as Y from 'yjs';
import type { Validator } from './schemas/schema.js';
import type { BaseValidator } from './schemas/base.js';
import type { ObjectShape } from './schemas/object.js';

export const findArrayPaths = (paths: IterableIterator<string>, basePath?: string) => {
	const basePathPattern = basePath ? `^${basePath}\\.` : '';
	const pathPatternRegex = new RegExp(`${basePathPattern}.*\\d+(?:\\.|$)`);
	const matches: string[] = [];

	for (const path of paths) {
		if (pathPatternRegex.test(path)) {
			matches.push(path);
		}
	}

	return matches;
};

export const applyDefaultOrValue = (value: any, validator: BaseValidator<any>, yText: Y.Text) => {
	const DEFAULT_VALUE = value === null ? null : (value ?? validator.$schema.default);

	if (DEFAULT_VALUE !== undefined && (!yText.length || value !== undefined)) {
		const length = yText.length;
		const stringifiedDefaultValue = (validator as BaseValidator<any>).stringify(DEFAULT_VALUE);

		yText.applyDelta(
			length
				? [{ delete: length }, { insert: stringifiedDefaultValue }]
				: [{ insert: stringifiedDefaultValue }]
		);
	}
};

export const isMissingOptionnal = ({
	parent,
	key,
	validator
}: {
	parent: Y.Map<any> | Y.Array<any>;
	key: string | number;
	validator: Validator;
}) => {
	const exists = parent instanceof Y.Map ? parent.has(String(key)) : !!parent.get(Number(key));
	const isMissingOptionnal = validator.$schema.optional && !exists;
	return isMissingOptionnal;
};

export const getTypeFromParent = <T extends Y.AbstractType<any>>({
	parent,
	key,
	instance
}: {
	parent: Y.Map<any> | Y.Array<any>;
	key: string | number;
	instance: new () => T;
}): T => {
	const isArray = parent instanceof Y.Array;
	const type = new instance();
	const typeInParent = (isArray ? parent.get(Number(key)) : parent.get(String(key))) as T;

	const setAndReturnType = () => {
		if (isArray) {
			parent.delete(Number(key));
			parent.insert(Number(key), [type]);
		} else {
			parent.delete(String(key));
			parent.set(String(key), type);
		}
		return type as T;
	};
	if (!typeInParent || typeInParent._item?.deleted) {
		return setAndReturnType() as T;
	}
	if (!(typeInParent instanceof instance)) {
		return setAndReturnType() as T;
	} else {
		return typeInParent as T;
	}
};

export const getInstance = (
	key: string,
	shape: ObjectShape
): (new () => Y.AbstractType<any>) | null => {
	const validator = shape[key] as Validator | undefined;
	if (validator) {
		switch (validator.$schema.kind) {
			case 'object':
				return Y.Map;
			case 'array':
				return Y.Array;
			default:
				return Y.Text;
		}
	}
	return null;
};
