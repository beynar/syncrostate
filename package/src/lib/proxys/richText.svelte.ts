import type { RichTextValidator } from '../schemas/richtext.js';
import * as Y from 'yjs';

type Delta =
	| {
			insert: string;
			attributes: Record<string, any>;
	  }
	| {
			delete: number;
	  }
	| {
			retain: number;
	  };

type RichText = {
	text: string;
	marks: Record<string, any>;
}[];

const deltaToRichText = (deltas: Delta[]): RichText => {
	let richText: RichText = [];

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

type OnSetCallback = (params: {
	index: number;
	markKey?: string;
	value: any;
	type: 'text' | 'mark';
}) => void;

const createRecursiveProxy = (
	target: any,
	path: (string | number)[] = [],
	onSet?: OnSetCallback
): any => {
	return new Proxy(target, {
		get: (obj, prop: string | symbol) => {
			const value = obj[prop];
			if (typeof prop === 'symbol' || prop === 'toJSON') {
				return value;
			}

			if (value && typeof value === 'object') {
				return createRecursiveProxy(value, path.concat(prop), onSet);
			}

			return value;
		},
		set: (obj, prop: string | symbol, value) => {
			const newPath = [...path, prop];

			if (onSet) {
				const index = path.find((p): p is number => typeof p === 'number') ?? 0;

				if (path.includes('marks')) {
					onSet({
						index,
						markKey: String(prop),
						value,
						type: 'mark'
					});
				} else if (prop === 'text') {
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
	validator: RichTextValidator;
	private yType: Y.Text;

	#textContent = $state<string>('');
	#content = $state<RichText>([{ text: '', marks: {} }]);
	#contentProxy = createRecursiveProxy(this.#content, [], (params) => {
		if (params.type === 'mark') {
			this.format(params.index, 1, { [params.markKey!]: params.value });
		} else if (params.type === 'text') {
			this.delete(params.index);
			this.insert(params.index, params.value);
		}
	});

	constructor(yType: Y.Text, validator: RichTextValidator) {
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

	format = (index: number, length: number, attributes?: Record<string, any>) => {
		this.yType.format(index, length, attributes || {});
	};
	insert = (index: number, value: string, attributes?: Record<string, any>) => {
		this.yType.insert(index, value, attributes || {});
	};
	delete = (index: number, length: number = 1) => {
		this.yType.delete(index, length);
	};
	applyDelta = (...delta: Delta[]) => {
		this.yType.applyDelta(delta);
	};
}
