import { e as escape_html } from "../../chunks/escaping.js";
import { g as getContext, c as pop, p as push } from "../../chunks/index.js";
import { n as noop } from "../../chunks/utils.js";
import { w as writable } from "../../chunks/exports.js";
const SNAPSHOT_KEY = "sveltekit:snapshot";
const SCROLL_KEY = "sveltekit:scroll";
function notifiable_store(value) {
  const store = writable(value);
  let ready = true;
  function notify() {
    ready = true;
    store.update((val) => val);
  }
  function set(new_value) {
    ready = false;
    store.set(new_value);
  }
  function subscribe(run) {
    let old_value;
    return store.subscribe((new_value) => {
      if (old_value === void 0 || ready && new_value !== old_value) {
        run(old_value = new_value);
      }
    });
  }
  return { notify, set, subscribe };
}
function create_updated_store() {
  const { set, subscribe } = writable(false);
  {
    return {
      subscribe,
      // eslint-disable-next-line @typescript-eslint/require-await
      check: async () => false
    };
  }
}
let updated;
const is_legacy = noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString());
if (is_legacy) {
  ({
    data: {},
    form: null,
    error: null,
    params: {},
    route: { id: null },
    state: {},
    status: -1,
    url: new URL("https://example.com")
  });
  updated = { current: false };
} else {
  updated = new class Updated {
    current = false;
  }();
}
function get(key, parse = JSON.parse) {
  try {
    return parse(sessionStorage[key]);
  } catch {
  }
}
get(SCROLL_KEY) ?? {};
get(SNAPSHOT_KEY) ?? {};
const stores = {
  url: /* @__PURE__ */ notifiable_store({}),
  page: /* @__PURE__ */ notifiable_store({}),
  navigating: /* @__PURE__ */ writable(
    /** @type {import('@sveltejs/kit').Navigation | null} */
    null
  ),
  updated: /* @__PURE__ */ create_updated_store()
};
({
  get current() {
    return updated.current;
  },
  check: stores.updated.check
});
function context() {
  return getContext("__request__");
}
const page$1 = {
  get data() {
    return context().page.data;
  },
  get error() {
    return context().page.error;
  },
  get form() {
    return context().page.form;
  },
  get params() {
    return context().page.params;
  },
  get route() {
    return context().page.route;
  },
  get state() {
    return context().page.state;
  },
  get status() {
    return context().page.status;
  },
  get url() {
    return context().page.url;
  }
};
const page = page$1;
function Error$1($$payload, $$props) {
  push();
  $$payload.out += `<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`;
  pop();
}
export {
  Error$1 as default
};
