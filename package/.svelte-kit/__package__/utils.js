import * as Y from 'yjs';
export const isMissingOptionnal = ({ parent, key, validator }) => {
    const exists = parent instanceof Y.Map ? parent.has(String(key)) : !!parent.get(Number(key));
    const isMissingOptionnal = validator.$schema.optional && !exists;
    const hasDefault = validator.$schema.default !== undefined;
    return isMissingOptionnal && !hasDefault;
};
export const getTypeFromParent = ({ parent, key, validator, forceNewType, value }) => {
    const isArray = parent instanceof Y.Array;
    const instance = getInstance(validator);
    const isText = instance === Y.Text;
    const type = isText && value ? new Y.Text(value) : new instance();
    const typeInParent = (isArray ? parent.get(Number(key)) : parent.get(String(key)));
    const setAndReturnType = () => {
        if (isArray) {
            parent.insert(Number(key), [type]);
        }
        else {
            parent.delete(String(key));
            parent.set(String(key), type);
        }
        return type;
    };
    if (!typeInParent || typeInParent._item?.deleted || forceNewType) {
        return setAndReturnType();
    }
    if (!(typeInParent instanceof instance)) {
        return setAndReturnType();
    }
    else {
        return typeInParent;
    }
};
export const getInstance = (validator) => {
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
