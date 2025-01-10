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
    // Import your Yjs provider
	import { createClient } from '@liveblocks/client';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';

    // Import syncroState and y (the schema builder)
    import { syncroState, y } from 'syncrostate';

    // Declare the syncroState
    const document = syncroState({
    // Connect to a Yjs provider and then call the synced callback when the document is synced
		sync: async ({ doc, synced }) => {
            // Create a liveblocks client
            const client = createClient({
                publicApiKey: ''
            });
            const { room } = client.enterRoom('room');
			const yProvider = new LiveblocksYjsProvider(room, doc);
			yProvider.on('synced', () => {
				synced();
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
