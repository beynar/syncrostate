<script lang="ts">
	import hljs from 'highlight.js';
	import 'highlight.js/styles/dark.css';
	import javascript from 'highlight.js/lib/languages/javascript';
	hljs.registerLanguage('javascript', javascript);

	const highlight = (node: HTMLElement) => {
		const code = node.textContent;
		const highlighted = hljs.highlight(code!, { language: 'javascript' }).value;
		node.innerHTML = highlighted;
	};
</script>

<section id="features" class="border-t border-white/10 pb-24 pt-12">
	<div class="container mx-auto px-6">
		<h2 class="mb-12 mt-0 text-center text-2xl font-bold">Usage</h2>

		<div class="mockup-code bg-primary text-primary-content text-xs">
			<pre use:highlight>
			{`
    <script>
    import { createClient } from '@liveblocks/client';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';

    // Import syncroState and y (the schema builder)
    import { syncroState, y } from 'syncrostate';

    // Declare the syncroState
    const document = syncroState({
    // Return a promise that resolves when the remote document is synced
		connect: async ({ doc }) => {
            // Create a liveblocks client
            const client = createClient({
                publicApiKey: ''
            });
            const { room } = client.enterRoom('your-room-id-10');
			return new Promise((resolve, reject) => {
				const yProvider = new LiveblocksYjsProvider(room, doc);
				yProvider.on('synced', () => {
					resolve();
				});
			});
		},
		// Define the schema of the state
		schema: {
			nodes: y.array(
				y.object({
					type: y.enum('rect', 'circle'),
					x: y.number(),
					y: y.number(),
					fill: y.string()
				})
			)
		}
	});
    </script>

    <button onclick={() => {
        // Mutate the state
        document.nodes.push({
            type: 'rect',
            x: 100,
            y: 100,
            fill: 'red'
        });
    }}>Add node</button>
  `}
    </pre>
		</div>
	</div>
</section>
