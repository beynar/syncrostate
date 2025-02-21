var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var object_prototype = Object.prototype;
var get_prototype_of = Object.getPrototypeOf;
const noop = () => {
};
function run(fn) {
  return fn();
}
export {
  is_array as a,
  array_from as b,
  get_prototype_of as c,
  define_property as d,
  get_descriptor as g,
  index_of as i,
  noop as n,
  object_prototype as o,
  run as r
};
