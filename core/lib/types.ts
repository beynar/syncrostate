// Adapted from type-fest SimplifyDeep
export type ConditionalSimplifyDeep<
	Type,
	ExcludeType = never,
	IncludeType = unknown
> = Type extends ExcludeType
	? Type
	: Type extends IncludeType
		? { [TypeKey in keyof Type]: ConditionalSimplifyDeep<Type[TypeKey], ExcludeType, IncludeType> }
		: Type;

export type NonRecursiveType =
	| null
	| undefined
	| string
	| number
	| boolean
	| Date
	| symbol
	| bigint
	| Function
	| (new (...arguments_: any[]) => unknown);

export type Simplify<Type, ExcludeType = never> = ConditionalSimplifyDeep<
	Type,
	ExcludeType | NonRecursiveType | Set<unknown> | Map<unknown, unknown>,
	object
>;
