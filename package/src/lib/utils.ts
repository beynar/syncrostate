import * as Y from 'yjs';
import type { Validator } from './schemas/schema.js';

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
	const hasDefault = validator.$schema.default !== undefined;
	return isMissingOptionnal && !hasDefault;
};

export const getTypeFromParent = <T extends Y.Array<any> | Y.Map<any> | Y.Text>({
	parent,
	key,
	validator,
	forceNewType,
	value
}: {
	parent: Y.Map<any> | Y.Array<any>;
	key: string | number;
	value?: string;
	forceNewType?: boolean;
	validator: Validator;
}): T => {
	const isArray = parent instanceof Y.Array;
	const instance = getInstance(validator) as new () => Y.Array<any> | Y.Map<any> | Y.Text;
	const isText = instance === Y.Text;

	const type = isText && value ? new Y.Text(value) : new instance();

	const typeInParent = (isArray ? parent.get(Number(key)) : parent.get(String(key))) as T;

	const setAndReturnType = () => {
		if (isArray) {
			parent.insert(Number(key), [type]);
		} else {
			parent.delete(String(key));
			parent.set(String(key), type);
		}
		return type as T;
	};
	if (!typeInParent || typeInParent._item?.deleted || forceNewType) {
		return setAndReturnType() as T;
	}
	if (!(typeInParent instanceof instance)) {
		return setAndReturnType() as T;
	} else {
		return typeInParent as T;
	}
};

export const getInstance = (validator: Validator): (new () => Y.AbstractType<any>) | null => {
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
