import { e as escape_html } from "../../../chunks/escaping.js";
import { c as pop, p as push } from "../../../chunks/index.js";
import { r as run } from "../../../chunks/utils.js";
function Test($$payload, $$props) {
  push();
  let { name } = $$props;
  $$payload.out += `<div class="w-fit mx-auto my-10">${escape_html(name)}</div>`;
  pop();
}
const createProxy = () => {
  return new Proxy(
    run(() => {
      return {};
    }),
    {
      get() {
        return "hello";
      }
    }
  );
};
function _page($$payload, $$props) {
  push();
  let proxiedData = createProxy();
  Test($$payload, { name: proxiedData.arizona });
  $$payload.out += `<!----> <button>change arizona</button> <button>change ${escape_html(proxiedData.marseille)}</button>`;
  pop();
}
export {
  _page as default
};
