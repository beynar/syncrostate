<script>
	import { syncroState, y } from 'syncrostate';
	import { onMount } from 'svelte';

	// Define a discriminated union for API responses
	const apiResponseSchema = y.discriminatedUnion('status', [
		y.object({
			status: y.literal('success'),
			data: y.string(),
			timestamp: y.number()
		}),
		y.object({
			status: y.literal('error'),
			message: y.string(),
			code: y.number()
		}),
		y.object({
			status: y.literal('loading')
		})
	]);

	// Define a discriminated union for user types
	const userSchema = y.discriminatedUnion('type', [
		y.object({
			type: y.literal('admin'),
			name: y.string(),
			permissions: y.array(y.string())
		}),
		y.object({
			type: y.literal('user'),
			name: y.string(),
			email: y.string()
		}),
		y.object({
			type: y.literal('guest'),
			sessionId: y.string()
		})
	]);

	const schema = y.object({
		apiResponse: apiResponseSchema,
		currentUser: userSchema
	});

	let state = $state();

	onMount(() => {
		state = syncroState(schema, {
			apiResponse: { status: 'loading' },
			currentUser: { type: 'guest', sessionId: 'guest-123' }
		});
	});

	// Demo functions to simulate different states
	function simulateSuccess() {
		if (state) {
			state.apiResponse = {
				status: 'success',
				data: 'Hello from the API!',
				timestamp: Date.now()
			};
		}
	}

	function simulateError() {
		if (state) {
			state.apiResponse = {
				status: 'error',
				message: 'Failed to fetch data',
				code: 404
			};
		}
	}

	function simulateLoading() {
		if (state) {
			state.apiResponse = { status: 'loading' };
		}
	}

	function switchToAdmin() {
		if (state) {
			state.currentUser = {
				type: 'admin',
				name: 'John Admin',
				permissions: ['read', 'write', 'delete']
			};
		}
	}

	function switchToUser() {
		if (state) {
			state.currentUser = {
				type: 'user',
				name: 'Jane User',
				email: 'jane@example.com'
			};
		}
	}

	function switchToGuest() {
		if (state) {
			state.currentUser = {
				type: 'guest',
				sessionId: 'guest-456'
			};
		}
	}
</script>

<div class="space-y-8 p-6">
	<div>
		<h2 class="mb-4 text-2xl font-bold">Discriminated Union Demo</h2>
		<p class="text-gray-400 mb-6">
			Discriminated unions allow you to create type-safe state that can be one of several variants,
			determined by a discriminant field. Perfect for API responses, user types, and more!
		</p>
	</div>

	{#if state}
		<!-- API Response Demo -->
		<div class="rounded-lg border border-gray-600 bg-gray-800 p-6">
			<h3 class="mb-4 text-xl font-semibold">API Response State</h3>

			<div class="mb-4 space-x-2">
				<button
					onclick={simulateLoading}
					class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Loading
				</button>
				<button
					onclick={simulateSuccess}
					class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
				>
					Success
				</button>
				<button
					onclick={simulateError}
					class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					Error
				</button>
			</div>

			<div class="rounded bg-gray-900 p-4">
				<div class="mb-2 text-sm text-gray-400">Current State:</div>
				{#if state.apiResponse.status === 'loading'}
					<div class="text-blue-400">🔄 Loading...</div>
				{:else if state.apiResponse.status === 'success'}
					<div class="text-green-400">
						✅ Success: {state.apiResponse.data}
						<div class="text-xs text-gray-400">
							Timestamp: {new Date(state.apiResponse.timestamp).toLocaleTimeString()}
						</div>
					</div>
				{:else if state.apiResponse.status === 'error'}
					<div class="text-red-400">
						❌ Error {state.apiResponse.code}: {state.apiResponse.message}
					</div>
				{/if}
			</div>
		</div>

		<!-- User Type Demo -->
		<div class="rounded-lg border border-gray-600 bg-gray-800 p-6">
			<h3 class="mb-4 text-xl font-semibold">User Type State</h3>

			<div class="mb-4 space-x-2">
				<button
					onclick={switchToGuest}
					class="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
				>
					Guest
				</button>
				<button
					onclick={switchToUser}
					class="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
				>
					User
				</button>
				<button
					onclick={switchToAdmin}
					class="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
				>
					Admin
				</button>
			</div>

			<div class="rounded bg-gray-900 p-4">
				<div class="mb-2 text-sm text-gray-400">Current User:</div>
				{#if state.currentUser.type === 'guest'}
					<div class="text-gray-400">
						👤 Guest User
						<div class="text-xs">Session ID: {state.currentUser.sessionId}</div>
					</div>
				{:else if state.currentUser.type === 'user'}
					<div class="text-purple-400">
						👨‍💻 User: {state.currentUser.name}
						<div class="text-xs">Email: {state.currentUser.email}</div>
					</div>
				{:else if state.currentUser.type === 'admin'}
					<div class="text-orange-400">
						👑 Admin: {state.currentUser.name}
						<div class="text-xs">
							Permissions: {state.currentUser.permissions.join(', ')}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- JSON View -->
		<div class="rounded-lg border border-gray-600 bg-gray-800 p-6">
			<h3 class="mb-4 text-xl font-semibold">Raw State (JSON)</h3>
			<pre class="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-green-400">{JSON.stringify(
					{
						apiResponse: state.apiResponse,
						currentUser: state.currentUser
					},
					null,
					2
				)}</pre>
		</div>

		<!-- Code Example -->
		<div class="rounded-lg border border-gray-600 bg-gray-800 p-6">
			<h3 class="mb-4 text-xl font-semibold">Code Example</h3>
			<pre class="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-300"><code
					>{`// Define discriminated union schemas
const apiResponseSchema = y.discriminatedUnion('status', [
  y.object({ 
    status: y.literal('success'), 
    data: y.string(), 
    timestamp: y.number() 
  }),
  y.object({ 
    status: y.literal('error'), 
    message: y.string(), 
    code: y.number() 
  }),
  y.object({ 
    status: y.literal('loading') 
  })
]);

const userSchema = y.discriminatedUnion('type', [
  y.object({
    type: y.literal('admin'),
    name: y.string(),
    permissions: y.array(y.string())
  }),
  y.object({
    type: y.literal('user'),
    name: y.string(),
    email: y.string()
  }),
  y.object({
    type: y.literal('guest'),
    sessionId: y.string()
  })
]);

// Use in your state
const schema = y.object({
  apiResponse: apiResponseSchema,
  currentUser: userSchema
});

const state = syncroState(schema);

// Type-safe updates
state.apiResponse = { status: 'success', data: 'Hello!', timestamp: Date.now() };
state.currentUser = { type: 'admin', name: 'John', permissions: ['read', 'write'] };`}</code
				></pre>
		</div>
	{:else}
		<div class="text-center text-gray-400">Loading demo...</div>
	{/if}
</div>
