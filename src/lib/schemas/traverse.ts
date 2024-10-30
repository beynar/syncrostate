import type { ObjectShape } from './object.js';
import * as Y from 'yjs';
import type { Validator } from './schema.js';

// REMINDER OF THE MENTAL MODEL
// This function MUST be executed after the offline => remote synchronisation
// Otherwise, the local changes will be lost and any other peer will have their changes overwritten

const getTypeFromParent = <T extends Y.AbstractType<any>>(
	parent: Y.Map<any> | Y.Array<any> | Y.Doc,
	key: any,
	instance: new () => T
): T => {
	const isDoc = parent instanceof Y.Doc;
	const isArray = parent instanceof Y.Array;
	const type = new instance();
	const typeInParent = (
		isDoc ? parent.share.get(key) : isArray ? parent.get(Number(key)) : parent.get(key)
	) as T;

	const setAndReturnType = () => {
		if (!isDoc) {
			if (isArray) {
				parent.delete(Number(key));
				parent.insert(Number(key), [type]);
			} else {
				parent.delete(key);
				parent.set(key, type);
			}
			return type as T;
		} else {
			// Ensure the type is deleted from the doc
			parent.share.delete(key);
			if (type instanceof Y.Text) {
				return parent.getText(key);
			}
			if (type instanceof Y.Array) {
				return parent.getArray(key);
			}
			if (type instanceof Y.Map) {
				return parent.getMap(key);
			}
			if (type instanceof Y.XmlText) {
				return parent.getText(key);
			}
			if (type instanceof Y.XmlFragment) {
				return parent.getXmlFragment(key);
			}
			if (type instanceof Y.XmlElement) {
				return parent.getXmlElement(key);
			}
		}
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

export const traverseShape = ({
	doc = new Y.Doc(),
	shape,
	path = '',
	parent = doc,
	onType
}: {
	doc?: Y.Doc;
	shape: ObjectShape;
	parent?: Y.Map<any> | Y.Doc;
	path?: string;
	onType: (p: { path: string; type: Y.AbstractType<any>; validator: Validator }) => void;
}) => {
	const isDocInitialized = doc.getText('$$$$$').toString() === '$$$$$';
	const isRoot = parent instanceof Y.Doc;
	const validate = (
		key: string,
		newPath: string,
		validator: Validator,
		parent: Y.Map<any> | Y.Doc
	) => {
		switch (validator.$schema.kind) {
			case 'richText':
			case 'boolean':
			case 'date':
			case 'string':
			case 'enum': {
				const yType = getTypeFromParent(parent, key, Y.Text);

				if (validator.$schema.default) {
					if (!yType.length) {
						yType.applyDelta([{ insert: validator.stringify(validator.$schema.default) }]);
					}
					// TODO implement default
					// yType.insert(0, validator.$schema.default || '');
				}
				onType({
					path: newPath,
					validator,
					type: yType
				});
				break;
			}
			case 'array': {
				const yArray = getTypeFromParent(parent, key, Y.Array);
				onType({
					path: newPath,
					validator,
					type: yArray
				});
				const arrayValidator = validator.$schema.shape as Validator;

				if (!yArray.length) {
					// TODO handle optional / nullable or default here
				} else {
					for (let i = 0; ; i++) {
						const arrayPath = `${newPath}.${i}`;
						const value = yArray.get(i);

						if (!value) {
							// TODO handle optional / nullable or default here
							break;
						}
						switch (arrayValidator.$schema.kind) {
							case 'richText':
							case 'boolean':
							case 'date':
							case 'string':
							case 'enum': {
								const yText = getTypeFromParent(yArray, i, Y.Text);
								onType({
									path: arrayPath,
									validator: arrayValidator,
									type: yText
								});
								break;
							}
							case 'object': {
								const yObject = getTypeFromParent(yArray, i, Y.Map);

								onType({
									path: arrayPath,
									validator: arrayValidator,
									type: yObject
								});
								traverseShape({
									shape: arrayValidator.$schema.shape as ObjectShape,
									path: arrayPath,
									parent: yObject,
									onType
								});
								break;
							}

							case 'array': {
								// Not implemented
								break;
							}
						}
					}
				}
				break;
			}

			case 'object': {
				// TODO implement default / nullable / optionnal safety
				// yType.insert(0, validator.$schema.default || '');
				const yObject = getTypeFromParent(parent, key, Y.Map);

				onType({ path: newPath, type: yObject, validator });
				traverseShape({
					shape: validator.$schema.shape as ObjectShape,
					path: newPath,
					parent: yObject,
					onType
				});
				break;
			}
		}
	};

	for (const [key, validator] of Object.entries(shape)) {
		validate(key, path ? `${path}.${key}` : key, validator, parent);
	}

	if (!isDocInitialized && isRoot) {
		doc.getText('$$$$$').applyDelta([{ insert: '$$$$$' }]);
	}
	return doc;
};
