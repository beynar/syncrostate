import type { Primitive, Schema } from './types.js';
import { isPrimitive } from './utils.js';
import * as Y from 'yjs';
export const traverseSchema = ({
	doc = new Y.Doc(),
	schema,
	path = '',
	parent = doc.getMap('root'),
	follower,
	onType
}: {
	doc?: Y.Doc;
	schema: Schema;
	parent?: Y.Map<any>;
	follower: any;
	path?: string;
	onType: (p: {
		path: string;
		primitive?: Primitive;
		follower?: any | null;
		type: Y.AbstractType<any>;
	}) => void;
}) => {
	for (const [key, schemaType] of Object.entries(schema)) {
		const isArray = Array.isArray(schemaType);
		const type = isArray ? schemaType[0] : schemaType;
		const primitive = isPrimitive(type) ? type : undefined;
		const schema = isPrimitive(type) ? undefined : type;
		const newPath = path ? `${path}.${key}` : key;
		if (primitive) {
			if (isArray) {
				const yType = new Y.Array();
				parent.set(key, yType);
				onType({ path: newPath, primitive, follower: follower?.[key], type: yType });
				for (let i = 0; ; i++) {
					const arrayPath = `${newPath}.${i}`;
					const value = follower?.[key]?.[i];
					if (!value) break;
					const yValue = new Y.Text(value || '');
					yType.insert(i, [yValue]);
					onType({ path: arrayPath, primitive, follower: value, type: yValue });
				}
			} else {
				const yType = new Y.Text();
				yType.setAttribute('t', 1);
				parent.set(key, yType);
				yType.insert(0, follower?.[key] || '');
				onType({ path: newPath, primitive, follower: follower?.[key], type: yType });
			}
		} else if (schema) {
			if (isArray) {
				const yType = new Y.Array();
				parent.set(key, yType);
				onType({ path: newPath, primitive, follower: follower?.[key], type: yType });
				for (let i = 0; ; i++) {
					const arrayPath = `${newPath}.${i}`;
					const value = follower?.[key]?.[i];
					if (!value) break;
					const nestedMap = new Y.Map();
					yType.insert(i, [nestedMap]);
					onType({ path: arrayPath, primitive, follower: value, type: yType });
					traverseSchema({
						schema,
						path: arrayPath,
						follower: value,
						parent: nestedMap,
						onType
					});
				}
			} else {
				const yType = new Y.Map();
				parent.set(key, yType);
				onType({ path: newPath, follower: follower?.[key], type: yType });
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
};
