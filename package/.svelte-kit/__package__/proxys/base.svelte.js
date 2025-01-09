import * as Y from 'yjs';
import { NULL } from '../constants.js';
export class BaseSyncedType {
    yType;
    rawValue = $state('');
    observeCallback;
    state;
    parent;
    key;
    constructor(opts) {
        this.yType = opts.yType;
        this.rawValue = opts.yType.toString();
        this.yType.observe(this.observe);
        this.parent = opts.parent;
        this.key = opts.key;
        this.state = opts.state;
    }
    deletePropertyFromParent = () => {
        this.parent.deleteProperty({}, this.key);
    };
    observe = (e, transact) => {
        if (transact.origin !== this.state.transactionKey) {
            this.rawValue = this.yType.toString();
            this.observeCallback?.(e, transact);
        }
    };
    destroy = () => {
        this.yType.unobserve(this.observe);
    };
    setYValue(value) {
        if (this.rawValue !== value) {
            const length = this.yType.length;
            this.rawValue = value;
            this.state.transaction(() => {
                this.yType.applyDelta(length ? [{ delete: length }, { insert: value ?? NULL }] : [{ insert: value ?? NULL }]);
            });
        }
    }
}
