
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const NVM_INC: string;
	export const _VOLTA_TOOL_RECURSION: string;
	export const rvm_use_flag: string;
	export const rvm_bin_path: string;
	export const TERM_PROGRAM: string;
	export const NODE: string;
	export const FNM_LOGLEVEL: string;
	export const INIT_CWD: string;
	export const rvm_quiet_flag: string;
	export const NVM_CD_FLAGS: string;
	export const GEM_HOME: string;
	export const rvm_gemstone_url: string;
	export const TERM: string;
	export const SHELL: string;
	export const FNM_NODE_DIST_MIRROR: string;
	export const rvm_docs_type: string;
	export const TMPDIR: string;
	export const IRBRC: string;
	export const HOMEBREW_REPOSITORY: string;
	export const npm_config_global_prefix: string;
	export const TERM_PROGRAM_VERSION: string;
	export const ZDOTDIR: string;
	export const VOLTA_HOME: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const MallocNanoZone: string;
	export const FIG_NEW_SESSION: string;
	export const CURSOR_TRACE_ID: string;
	export const COLOR: string;
	export const rvm_hook: string;
	export const MY_RUBY_HOME: string;
	export const npm_config_noproxy: string;
	export const npm_config_local_prefix: string;
	export const PNPM_HOME: string;
	export const npm_config_python: string;
	export const USER: string;
	export const NVM_DIR: string;
	export const rvm_gemstone_package_file: string;
	export const COMMAND_MODE: string;
	export const npm_config_globalconfig: string;
	export const CW_NEW_SESSION: string;
	export const rvm_path: string;
	export const SSH_AUTH_SOCK: string;
	export const Q_SET_PARENT_CHECK: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_execpath: string;
	export const rvm_proxy: string;
	export const rvm_ruby_file: string;
	export const PAGER: string;
	export const LSCOLORS: string;
	export const FNM_VERSION_FILE_STRATEGY: string;
	export const rvm_silent_flag: string;
	export const rvm_prefix: string;
	export const FNM_ARCH: string;
	export const rvm_ruby_make: string;
	export const PATH: string;
	export const npm_package_json: string;
	export const npm_config_engine_strict: string;
	export const npm_config_userconfig: string;
	export const npm_config_init_module: string;
	export const __CFBundleIdentifier: string;
	export const USER_ZDOTDIR: string;
	export const SHELL_PID: string;
	export const npm_command: string;
	export const TTY: string;
	export const PWD: string;
	export const VSCODE_NONCE: string;
	export const npm_lifecycle_event: string;
	export const EDITOR: string;
	export const npm_package_name: string;
	export const rvm_sdk: string;
	export const LANG: string;
	export const NODE_PATH: string;
	export const npm_config_npm_version: string;
	export const XPC_FLAGS: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const FNM_MULTISHELL_PATH: string;
	export const npm_config_node_gyp: string;
	export const RBENV_SHELL: string;
	export const npm_package_version: string;
	export const XPC_SERVICE_NAME: string;
	export const rvm_version: string;
	export const VSCODE_INJECTION: string;
	export const rvm_script_name: string;
	export const rvm_pretty_print_flag: string;
	export const SHLVL: string;
	export const HOME: string;
	export const rvm_ruby_mode: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const HOMEBREW_PREFIX: string;
	export const FNM_DIR: string;
	export const npm_config_cache: string;
	export const LOGNAME: string;
	export const LESS: string;
	export const npm_lifecycle_script: string;
	export const rvm_alias_expanded: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const LC_CTYPE: string;
	export const GEM_PATH: string;
	export const NVM_BIN: string;
	export const BUN_INSTALL: string;
	export const npm_config_user_agent: string;
	export const rvm_nightly_flag: string;
	export const rvm_ruby_make_install: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const INFOPATH: string;
	export const HOMEBREW_CELLAR: string;
	export const GIT_ASKPASS: string;
	export const rvm_niceness: string;
	export const Q_TERM: string;
	export const QTERM_SESSION_ID: string;
	export const rvm_ruby_bits: string;
	export const rvm_bin_flag: string;
	export const npm_config_init_author_name: string;
	export const rvm_only_path_flag: string;
	export const RUBY_VERSION: string;
	export const npm_node_execpath: string;
	export const npm_config_prefix: string;
	export const COLORTERM: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		NVM_INC: string;
		_VOLTA_TOOL_RECURSION: string;
		rvm_use_flag: string;
		rvm_bin_path: string;
		TERM_PROGRAM: string;
		NODE: string;
		FNM_LOGLEVEL: string;
		INIT_CWD: string;
		rvm_quiet_flag: string;
		NVM_CD_FLAGS: string;
		GEM_HOME: string;
		rvm_gemstone_url: string;
		TERM: string;
		SHELL: string;
		FNM_NODE_DIST_MIRROR: string;
		rvm_docs_type: string;
		TMPDIR: string;
		IRBRC: string;
		HOMEBREW_REPOSITORY: string;
		npm_config_global_prefix: string;
		TERM_PROGRAM_VERSION: string;
		ZDOTDIR: string;
		VOLTA_HOME: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		MallocNanoZone: string;
		FIG_NEW_SESSION: string;
		CURSOR_TRACE_ID: string;
		COLOR: string;
		rvm_hook: string;
		MY_RUBY_HOME: string;
		npm_config_noproxy: string;
		npm_config_local_prefix: string;
		PNPM_HOME: string;
		npm_config_python: string;
		USER: string;
		NVM_DIR: string;
		rvm_gemstone_package_file: string;
		COMMAND_MODE: string;
		npm_config_globalconfig: string;
		CW_NEW_SESSION: string;
		rvm_path: string;
		SSH_AUTH_SOCK: string;
		Q_SET_PARENT_CHECK: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_execpath: string;
		rvm_proxy: string;
		rvm_ruby_file: string;
		PAGER: string;
		LSCOLORS: string;
		FNM_VERSION_FILE_STRATEGY: string;
		rvm_silent_flag: string;
		rvm_prefix: string;
		FNM_ARCH: string;
		rvm_ruby_make: string;
		PATH: string;
		npm_package_json: string;
		npm_config_engine_strict: string;
		npm_config_userconfig: string;
		npm_config_init_module: string;
		__CFBundleIdentifier: string;
		USER_ZDOTDIR: string;
		SHELL_PID: string;
		npm_command: string;
		TTY: string;
		PWD: string;
		VSCODE_NONCE: string;
		npm_lifecycle_event: string;
		EDITOR: string;
		npm_package_name: string;
		rvm_sdk: string;
		LANG: string;
		NODE_PATH: string;
		npm_config_npm_version: string;
		XPC_FLAGS: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		FNM_MULTISHELL_PATH: string;
		npm_config_node_gyp: string;
		RBENV_SHELL: string;
		npm_package_version: string;
		XPC_SERVICE_NAME: string;
		rvm_version: string;
		VSCODE_INJECTION: string;
		rvm_script_name: string;
		rvm_pretty_print_flag: string;
		SHLVL: string;
		HOME: string;
		rvm_ruby_mode: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		HOMEBREW_PREFIX: string;
		FNM_DIR: string;
		npm_config_cache: string;
		LOGNAME: string;
		LESS: string;
		npm_lifecycle_script: string;
		rvm_alias_expanded: string;
		VSCODE_GIT_IPC_HANDLE: string;
		LC_CTYPE: string;
		GEM_PATH: string;
		NVM_BIN: string;
		BUN_INSTALL: string;
		npm_config_user_agent: string;
		rvm_nightly_flag: string;
		rvm_ruby_make_install: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		INFOPATH: string;
		HOMEBREW_CELLAR: string;
		GIT_ASKPASS: string;
		rvm_niceness: string;
		Q_TERM: string;
		QTERM_SESSION_ID: string;
		rvm_ruby_bits: string;
		rvm_bin_flag: string;
		npm_config_init_author_name: string;
		rvm_only_path_flag: string;
		RUBY_VERSION: string;
		npm_node_execpath: string;
		npm_config_prefix: string;
		COLORTERM: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
