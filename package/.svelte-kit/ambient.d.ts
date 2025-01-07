
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
	export const BUN_INSTALL: string;
	export const COLORTERM: string;
	export const COMMAND_MODE: string;
	export const CONDA_CHANGEPS1: string;
	export const ELECTRON_NO_ATTACH_CONSOLE: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const FNM_ARCH: string;
	export const FNM_DIR: string;
	export const FNM_LOGLEVEL: string;
	export const FNM_MULTISHELL_PATH: string;
	export const FNM_NODE_DIST_MIRROR: string;
	export const FNM_VERSION_FILE_STRATEGY: string;
	export const GEM_HOME: string;
	export const GEM_PATH: string;
	export const HOME: string;
	export const HOMEBREW_CELLAR: string;
	export const HOMEBREW_PREFIX: string;
	export const HOMEBREW_REPOSITORY: string;
	export const INFOPATH: string;
	export const IRBRC: string;
	export const LC_CTYPE: string;
	export const LESS: string;
	export const LOGNAME: string;
	export const LSCOLORS: string;
	export const LaunchInstanceID: string;
	export const MY_RUBY_HOME: string;
	export const MallocNanoZone: string;
	export const NODE_ENV: string;
	export const NVM_BIN: string;
	export const NVM_CD_FLAGS: string;
	export const NVM_DIR: string;
	export const NVM_INC: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const PAGER: string;
	export const PATH: string;
	export const PNPM_HOME: string;
	export const PWD: string;
	export const Q_SET_PARENT_CHECK: string;
	export const RBENV_SHELL: string;
	export const RUBY_VERSION: string;
	export const SECURITYSESSIONID: string;
	export const SHELL: string;
	export const SHELL_PID: string;
	export const SHLVL: string;
	export const SSH_AUTH_SOCK: string;
	export const SSH_SOCKET_DIR: string;
	export const TERM: string;
	export const TERM_PROGRAM: string;
	export const TERM_PROGRAM_VERSION: string;
	export const TEST: string;
	export const TMPDIR: string;
	export const TTY: string;
	export const USER: string;
	export const VITEST: string;
	export const VITEST_VSCODE: string;
	export const VITEST_VSCODE_LOG: string;
	export const VOLTA_HOME: string;
	export const VSCODE_AMD_ENTRYPOINT: string;
	export const VSCODE_CLI: string;
	export const VSCODE_CODE_CACHE_PATH: string;
	export const VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
	export const VSCODE_CWD: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const VSCODE_IPC_HOOK: string;
	export const VSCODE_NLS_CONFIG: string;
	export const VSCODE_PID: string;
	export const VSCODE_PROCESS_TITLE: string;
	export const WARP_HONOR_PS1: string;
	export const WARP_IS_LOCAL_SHELL_SESSION: string;
	export const WARP_USE_SSH_WRAPPER: string;
	export const XPC_FLAGS: string;
	export const XPC_SERVICE_NAME: string;
	export const _VOLTA_TOOL_RECURSION: string;
	export const __CFBundleIdentifier: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const rvm_bin_path: string;
	export const rvm_path: string;
	export const rvm_prefix: string;
	export const rvm_version: string;
	export const PROD: string;
	export const DEV: string;
	export const BASE_URL: string;
	export const MODE: string;
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
		BUN_INSTALL: string;
		COLORTERM: string;
		COMMAND_MODE: string;
		CONDA_CHANGEPS1: string;
		ELECTRON_NO_ATTACH_CONSOLE: string;
		ELECTRON_RUN_AS_NODE: string;
		FNM_ARCH: string;
		FNM_DIR: string;
		FNM_LOGLEVEL: string;
		FNM_MULTISHELL_PATH: string;
		FNM_NODE_DIST_MIRROR: string;
		FNM_VERSION_FILE_STRATEGY: string;
		GEM_HOME: string;
		GEM_PATH: string;
		HOME: string;
		HOMEBREW_CELLAR: string;
		HOMEBREW_PREFIX: string;
		HOMEBREW_REPOSITORY: string;
		INFOPATH: string;
		IRBRC: string;
		LC_CTYPE: string;
		LESS: string;
		LOGNAME: string;
		LSCOLORS: string;
		LaunchInstanceID: string;
		MY_RUBY_HOME: string;
		MallocNanoZone: string;
		NODE_ENV: string;
		NVM_BIN: string;
		NVM_CD_FLAGS: string;
		NVM_DIR: string;
		NVM_INC: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		PAGER: string;
		PATH: string;
		PNPM_HOME: string;
		PWD: string;
		Q_SET_PARENT_CHECK: string;
		RBENV_SHELL: string;
		RUBY_VERSION: string;
		SECURITYSESSIONID: string;
		SHELL: string;
		SHELL_PID: string;
		SHLVL: string;
		SSH_AUTH_SOCK: string;
		SSH_SOCKET_DIR: string;
		TERM: string;
		TERM_PROGRAM: string;
		TERM_PROGRAM_VERSION: string;
		TEST: string;
		TMPDIR: string;
		TTY: string;
		USER: string;
		VITEST: string;
		VITEST_VSCODE: string;
		VITEST_VSCODE_LOG: string;
		VOLTA_HOME: string;
		VSCODE_AMD_ENTRYPOINT: string;
		VSCODE_CLI: string;
		VSCODE_CODE_CACHE_PATH: string;
		VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
		VSCODE_CWD: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		VSCODE_IPC_HOOK: string;
		VSCODE_NLS_CONFIG: string;
		VSCODE_PID: string;
		VSCODE_PROCESS_TITLE: string;
		WARP_HONOR_PS1: string;
		WARP_IS_LOCAL_SHELL_SESSION: string;
		WARP_USE_SSH_WRAPPER: string;
		XPC_FLAGS: string;
		XPC_SERVICE_NAME: string;
		_VOLTA_TOOL_RECURSION: string;
		__CFBundleIdentifier: string;
		__CF_USER_TEXT_ENCODING: string;
		rvm_bin_path: string;
		rvm_path: string;
		rvm_prefix: string;
		rvm_version: string;
		PROD: string;
		DEV: string;
		BASE_URL: string;
		MODE: string;
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
