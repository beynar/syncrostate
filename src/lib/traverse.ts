import type { Primitive, Schema } from './types.js';
import { isPrimitive } from './utils.js';
import * as Y from 'yjs';
export const traverseSchema = ({
	doc = new Y.Doc(),
	schema,
	path = '',
	parent = doc,
	follower,
	onType
}: {
	doc?: Y.Doc;
	schema: Schema;
	parent?: Y.Map<any> | Y.Doc;
	follower: any;
	path?: string;
	onType: (p: {
		isRoot: boolean;
		path: string;
		schema: Schema | Primitive;
		follower?: any | null;
		type: Y.AbstractType<any>;
	}) => void;
}) => {
	const isRoot = parent instanceof Y.Doc;
	for (const [key, schemaType] of Object.entries(schema)) {
		const isArray = Array.isArray(schemaType);
		const type = isArray ? schemaType[0] : schemaType;
		const primitive = isPrimitive(type) ? type : undefined;
		const schema = isPrimitive(type) ? undefined : type;
		const newPath = path ? `${path}.${key}` : key;
		if (primitive) {
			if (isArray) {
				const yType = isRoot ? doc.getArray(key) : new Y.Array();
				!isRoot && parent.set(key, yType);
				onType({
					isRoot,
					path: newPath,
					schema: primitive,
					follower: follower?.[key],
					type: yType
				});
				for (let i = 0; ; i++) {
					const arrayPath = `${newPath}.${i}`;
					const value = follower?.[key]?.[i];
					if (!value) break;
					const yValue = new Y.Text(value || '');
					yType.insert(i, [yValue]);
					onType({
						isRoot: false,
						path: arrayPath,
						schema: primitive,
						follower: value,
						type: yValue
					});
				}
			} else {
				const yType = isRoot ? doc.getText(key) : new Y.Text();
				yType.setAttribute('t', 1);
				!isRoot && parent.set(key, yType);
				yType.insert(0, follower?.[key] || '');
				onType({
					isRoot,
					path: newPath,
					schema: primitive,
					follower: follower?.[key],
					type: yType
				});
			}
		} else if (schema) {
			if (isArray) {
				const yType = isRoot ? doc.getArray(key) : new Y.Array();
				!isRoot && parent.set(key, yType);
				onType({ isRoot, path: newPath, schema, follower: follower?.[key], type: yType });
				for (let i = 0; ; i++) {
					const arrayPath = `${newPath}.${i}`;
					const value = follower?.[key]?.[i];
					if (!value) break;
					const nestedMap = new Y.Map();
					yType.insert(i, [nestedMap]);
					onType({ isRoot: false, path: arrayPath, schema, follower: value, type: yType });
					traverseSchema({
						schema,
						path: arrayPath,
						follower: value,
						parent: nestedMap,
						onType
					});
				}
			} else {
				const yType = isRoot ? doc.getMap(key) : new Y.Map();
				!isRoot && parent.set(key, yType);
				onType({ isRoot, path: newPath, follower: follower?.[key], type: yType, schema });
				traverseSchema({
					schema,
					path: newPath,
					follower: follower?.[key],
					parent: yType,
					onType
				});
			}
		}
	}

	return doc;
};
