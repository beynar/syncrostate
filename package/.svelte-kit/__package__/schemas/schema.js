import { ArrayValidator } from './array.js';
import { BaseValidator } from './base.js';
import { BooleanValidator } from './boolean.js';
import { DateValidator } from './date.js';
import { EnumValidator } from './enum.js';
import { StringValidator } from './string.js';
import { ObjectValidator } from './object.js';
import { RichTextValidator } from './richtext.js';
import { NumberValidator } from './number.js';
import { SetValidator } from './set.js';
import { MapValidator } from './map.js';
export const y = {
    boolean: () => new BooleanValidator(),
    date: () => new DateValidator(),
    enum: (...values) => new EnumValidator(...values),
    string: () => new StringValidator(),
    richText: () => new RichTextValidator(),
    object: (shape) => new ObjectValidator(shape),
    array: (shape) => new ArrayValidator(shape),
    number: () => new NumberValidator(),
    set: (shape) => new SetValidator(shape),
    map: (shape) => new MapValidator(shape)
};
