import type { Validator } from '$lib/schemas/schema.js';
import { SvelteMap } from 'svelte/reactivity';
import * as Y from 'yjs';
import type { ObjectValidator } from '$lib/schemas/object.js';
import type { BaseValidator } from '$lib/schemas/base.js';
import { SyncedEnum } from './enum.svelte.js';
import { SyncedDate } from './date.svelte.js';
import { SyncedBoolean } from './boolean.svelte.js';
import type { StringValidator } from '$lib/schemas/string.js';
import type { NumberValidator } from '$lib/schemas/number.js';
import type { EnumValidator } from '$lib/schemas/enum.js';
import type { DateValidator } from '$lib/schemas/date.js';
import type { BooleanValidator } from '$lib/schemas/boolean.js';
import { SyncedText } from './text.svelte.js';
import { SyncedNumber } from './number.svelte.js';
import { SyncedObject } from './object.svellte.js';

export type SyncedState =
	| {
			type: Y.Map<any>;
			validator: ObjectValidator<any>;
			state?: SyncedObject;
	  }
	| {
			type: Y.Text;
			validator: BaseValidator<any>;
			state: SyncedText | SyncedNumber | SyncedDate | SyncedEnum<any> | SyncedBoolean;
	  };
export type SyncedStates = SyncedCache['syncedStates'];

export class SyncedCache {
	syncedStates = new SvelteMap<string, SyncedState>();

	undoManager: Y.UndoManager | null = null;

	constructor(undoManager: Y.UndoManager | null = null) {
		this.undoManager = undoManager;
	}

	destroy = () => {
		this.syncedStates.clear();
		this.undoManager = null;
	};

	remove = (path: string) => {
		const syncedState = this.syncedStates.get(path);
		if (syncedState) {
			const isOptional = syncedState.validator.$schema.optional;
			if (!isOptional) {
				throw new Error('cannot remove non optional fields');
			}
			const key = path.split('.').at(-1)!;
			syncedState.state?.destroy?.();

			const parent = syncedState.type.parent;
			if (parent instanceof Y.Doc) {
				parent.share.delete(key);
			} else if (parent instanceof Y.Array) {
				parent.delete(Number(key));
			} else if (parent instanceof Y.Map) {
				parent.delete(key);
			}
		}
		this.syncedStates.delete(path);
	};

	integrate = ({
		path,
		type,
		validator,
		isRoot
	}: {
		path: string;
		type: Y.AbstractType<any>;
		validator: Validator;
		isRoot?: boolean;
	}) => {
		if (isRoot) {
			if (!this.undoManager) {
				this.undoManager = new Y.UndoManager(type, {
					trackedOrigins: new Set(['INTERNAL'])
				});
			} else {
				this.undoManager.addToScope(type);
			}
		}

		if (type instanceof Y.Text) {
			switch (validator.$schema.kind) {
				case 'string': {
					this.syncedStates.set(path, {
						type,
						validator: validator as StringValidator,
						state: new SyncedText(type, validator as StringValidator)
					});
					break;
				}
				case 'number': {
					this.syncedStates.set(path, {
						type,
						validator: validator as NumberValidator,
						state: new SyncedNumber(type, validator as NumberValidator)
					});
					break;
				}
				case 'boolean': {
					this.syncedStates.set(path, {
						type,
						validator: validator as BooleanValidator,
						state: new SyncedBoolean(type, validator as BooleanValidator)
					});
					break;
				}
				case 'date': {
					this.syncedStates.set(path, {
						type,
						validator: validator as DateValidator,
						state: new SyncedDate(type, validator as DateValidator)
					});
					break;
				}
				case 'enum': {
					this.syncedStates.set(path, {
						type,
						validator: validator as EnumValidator<any, any, any>,
						state: new SyncedEnum(type, validator as EnumValidator<any, any, any>)
					});
					break;
				}
			}
		} else if (type instanceof Y.Map) {
			const _validator = validator as ObjectValidator<any>;
			this.syncedStates.set(path, {
				type: type as Y.Map<any>,
				validator: _validator,
				state: new SyncedObject({
					yType: type,
					path: path,
					syncedCache: this,
					validator: _validator
				})
			});
		}
	};
}
