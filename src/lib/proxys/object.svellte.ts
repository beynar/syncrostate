import type { Schema, SchemaOutput } from '$lib/types.js';
import * as Y from 'yjs';
import type { SyncedStates } from './syncedState.svelte.js';
import { toJSON } from '$lib/toJSON.js';
import { SvelteSet } from 'svelte/reactivity';
export const syncedObject = <S extends Schema>({
	yType,
	path,
	syncedStates
}: {
	yType: Y.Map<any>;
	schema: S;
	path: string;
	syncedStates: SyncedStates;
}) => {
	let keys = new SvelteSet<string>();

	yType.observe((e, transact) => {
		e._keys?.forEach((key) => {
			switch (key.action) {
				case 'add':
					keys.add(key.newValue);
					break;
				case 'delete':
					keys.delete(key.oldValue);
					break;
			}
		});
	});
	return new Proxy(
		{
			$doc: yType.doc,
			$type: yType
		} as SchemaOutput<S> & {
			$doc: Y.Doc;
			$type: Y.Map<any>;
		},
		{
			get(target, p) {
				if (typeof p !== 'string') {
					return Reflect.get(target, p);
				}
				if (p[0] === '$') {
					return Reflect.get(target, p);
				}
				if (p === 'toJSON') {
					return toJSON(path, yType, syncedStates);
				}

				const syncedState = syncedStates.get(p);

				if (!syncedState) {
					throw new Error('type not found');
				}

				if (syncedState?.type instanceof Y.Map) {
					return syncedObject({
						yType: syncedState.type,
						path: p,
						syncedStates,
						schema: syncedState.schema as Schema
					});
				}
				if (syncedState?.type instanceof Y.Text) {
					return syncedState.state?.value;
				}
			},
			set(target, p, value: any) {
				if (typeof p !== 'string') {
					throw new Error('p must be a string');
				}

				const syncedState = syncedStates.get(p);

				if (!syncedState) {
					throw new Error('type not found');
				}

				if (syncedState.type instanceof Y.Text) {
					syncedState.state!.value = value;
				}

				if (syncedState.type instanceof Y.Map) {
					syncedObject({
						yType: syncedState.type,
						path: path + '.' + p,
						syncedStates,
						schema: syncedState.schema as Schema
					});
				}
				return true;
			},
			deleteProperty: (target, p) => {
				if (typeof p !== 'string') {
					throw new Error('p must be a string');
				}
				yType.delete(p);
				return true;
			},
			has: (target, p) => {
				if (typeof p !== 'string') {
					throw new Error('p must be a string');
				}
				return yType.has(p);
			},
			getOwnPropertyDescriptor(target, p) {
				if ((typeof p === 'string' && yType.has(p)) || p === 'toJSON') {
					return {
						enumerable: true,
						configurable: true
					};
				}
				return undefined;
			},
			ownKeys: () => {
				return Array.from(yType.keys());
			}
		}
	);
};
