import * as Y from 'yjs';
const deltaToRichText = (deltas) => {
    let richText = [];
    for (let i = 0; i < deltas.length; i++) {
        const delta = deltas[i];
        if (!richText[i]) {
            richText.push({ text: '', marks: {} });
        }
        if ('insert' in delta) {
            richText[i].text += delta.insert;
            if ('attributes' in delta) {
                richText[i].marks = delta.attributes;
            }
        }
    }
    return richText;
};
const createRecursiveProxy = (target, path = [], onSet) => {
    return new Proxy(target, {
        get: (obj, prop) => {
            const value = obj[prop];
            if (typeof prop === 'symbol' || prop === 'toJSON') {
                return value;
            }
            if (value && typeof value === 'object') {
                return createRecursiveProxy(value, path.concat(prop), onSet);
            }
            return value;
        },
        set: (obj, prop, value) => {
            const newPath = [...path, prop];
            if (onSet) {
                const index = path.find((p) => typeof p === 'number') ?? 0;
                if (path.includes('marks')) {
                    onSet({
                        index,
                        markKey: String(prop),
                        value,
                        type: 'mark'
                    });
                }
                else if (prop === 'text') {
                    onSet({
                        index,
                        value,
                        type: 'text'
                    });
                }
            }
            obj[prop] = value;
            return true;
        }
    });
};
export class SyncedRichText {
    INTERNAL_ID = crypto.randomUUID();
    validator;
    yType;
    #textContent = $state('');
    #content = $state([{ text: '', marks: {} }]);
    #contentProxy = createRecursiveProxy(this.#content, [], (params) => {
        if (params.type === 'mark') {
            this.format(params.index, 1, { [params.markKey]: params.value });
        }
        else if (params.type === 'text') {
            this.delete(params.index);
            this.insert(params.index, params.value);
        }
    });
    constructor(yType, validator) {
        this.yType = yType;
        this.#textContent = yType.toString();
        this.#content = deltaToRichText(this.yType.toDelta());
        this.validator = validator;
        this.yType.observe((e, transact) => {
            if (transact.origin !== this.INTERNAL_ID) {
                this.#textContent = this.yType.toString();
                this.#content = deltaToRichText(this.yType.toDelta());
            }
        });
    }
    get text() {
        return this.#textContent;
    }
    get content() {
        return this.#contentProxy;
    }
    format = (index, length, attributes) => {
        this.yType.format(index, length, attributes || {});
    };
    insert = (index, value, attributes) => {
        this.yType.insert(index, value, attributes || {});
    };
    delete = (index, length = 1) => {
        this.yType.delete(index, length);
    };
    applyDelta = (...delta) => {
        this.yType.applyDelta(delta);
    };
}
