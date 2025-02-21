import { y } from '$lib/index.js';
import type { RequestEvent } from '@sveltejs/kit';

const procedure = (_: any) => _;
export class syncroServer {
	docs = {
		settings: procedure({
			schema: y.object({
				name: y.string().default('settings')
			}),
			get: (event: RequestEvent) => {
				return this.docs.settings.schema.get();
			},
			set: (event: RequestEvent, value: any, changes: { added: any; removed: any }) => {
				this.docs.settings.schema.set(value);
			},
			auth: (event: RequestEvent) => {
				return {
					read: true,
					write: true
				};
			}
		}),
		settings_2: procedure()
			.auth((event: RequestEvent) => {
				return {
					read: true,
					write: true
				};
			})
			.schema((y) => ({
				name: y.string().default('settings')
			}))
			.get((event: RequestEvent) => {
				return this.docs.settings.schema.get();
			})
			.set((event: RequestEvent, value: any, changes: { added: any; removed: any }) => {})
	};
}
