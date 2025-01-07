import * as Y from 'yjs';
import { SvelteDate } from 'svelte/reactivity';
import { NULL } from '../constants.js';
import { BaseSyncedType } from './base.svelte.js';
const SvelteDateProxy = (onSet) => {
    const date = new SvelteDate();
    return new Proxy(date, {
        get(target, prop) {
            const result = Reflect.get(target, prop);
            if (typeof result === 'function') {
                return (...args) => {
                    const ret = result.call(target, ...args);
                    if (typeof prop === 'string' && prop.startsWith('set')) {
                        onSet();
                    }
                    return ret;
                };
            }
            else {
                return result;
            }
        }
    });
};
export class SyncedDate extends BaseSyncedType {
    validator;
    date = SvelteDateProxy(() => {
        const newRawValue = this.date.toISOString();
        const isNull = this.date.getTime() === 0;
        if (newRawValue !== this.rawValue && !isNull) {
            this.setYValue(newRawValue);
        }
    });
    get value() {
        return this.rawValue === NULL || !this.rawValue ? null : this.date;
    }
    set value(value) {
        const isValid = this.validator.isValid(value);
        if (!isValid) {
            console.error('Invalid value', { value });
            return;
        }
        if (value !== null && value !== undefined) {
            this.setYValue(new Date(value).toISOString());
            this.date.setTime(new Date(value).getTime());
        }
        else {
            this.setYValue(null);
            this.date.setTime(0);
        }
    }
    setValue = (string) => {
        const { isValid, value } = this.validator.parse(string);
        if (isValid) {
            this.date.setTime(value?.getTime() || 0);
        }
    };
    observeCallback = () => {
        this.setValue(this.rawValue);
    };
    constructor(yType, validator) {
        super(yType);
        this.validator = validator;
        this.setValue(this.rawValue);
    }
}
