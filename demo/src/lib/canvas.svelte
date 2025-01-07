<script lang="ts" module>
	export let createCircle = (svg: SVGSVGElement, width: number) => {
		const rc = rough.svg(svg);
		const circle = rc.circle(width / 2, width / 2, width, { fill: 'purple' });
		return circle;
	};

	export let createRect = (svg: SVGSVGElement, width: number) => {
		const rc = rough.svg(svg);
		const rect = rc.rectangle(0, 0, width, width, { fill: 'red' });
		return rect;
	};

	export const createImage = (type: 'circle' | 'rect', width: number) => {
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', width.toString());
		svg.setAttribute('height', width.toString());
		const rect = type === 'circle' ? createCircle(svg, width) : createRect(svg, width);

		svg.appendChild(rect);

		const toDataUrl = (svg: SVGSVGElement) => {
			const serializer = new XMLSerializer();
			const svgStr = serializer.serializeToString(svg);
			const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
			return URL.createObjectURL(svgBlob);
		};
		let image = new Image(width);
		image.src = toDataUrl(svg);
		return image;
	};
</script>

<script lang="ts">
	import { Stage, Layer } from 'svelte-konva';
	import { Stage as KStage } from 'konva/lib/Stage';
	import rough from 'roughjs';
	import Shape from './Shape.svelte';

	const circle = (svg: SVGSVGElement) => {
		svg.appendChild(createCircle(svg, 40));
	};

	const rect = (svg: SVGSVGElement) => {
		svg.appendChild(createRect(svg, 40));
	};

	let stageRef = $state<KStage>();
	let draggedShape = $state();
	import { createClient } from '@liveblocks/client';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';
	import { syncroState, y } from 'syncrostate';
	let users = $state(1);
	const client = createClient({
		publicApiKey: 'pk_prod_TXiiCUekyBO_3gntGdLDEyqmJ0Qc6AqyfAoz0Pntk5JlzC4sSWFmjh4cP73rWXpm'
	});

	const { room } = client.enterRoom('your-room-id-10');
	room.subscribe('others', (others) => {
		users = others.length;
	});

	const synced = syncroState({
		connect: async ({ doc }) => {
			return new Promise((resolve, reject) => {
				const yProvider = new LiveblocksYjsProvider(room, doc);
				yProvider.on('synced', () => {
					resolve();
				});
			});
		},
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

	let stageWidth = $state(0);
</script>

<div
	bind:clientWidth={stageWidth}
	role="presentation"
	aria-label="canvas"
	ondrop={(e) => {
		if (!stageRef) return;
		e.preventDefault();
		// register event position
		stageRef.setPointersPositions(e);
		var pointerPosition = stageRef.getPointerPosition();
		var stageAttrs = stageRef.attrs;

		var x = (pointerPosition.x - stageAttrs.x) / (stageAttrs.scaleX || 1);
		var y = (pointerPosition.y - stageAttrs.y) / (stageAttrs.scaleY || 1);
		console.log({
			pointerPosition,
			scaleX: stageAttrs.scaleX,
			scaleY: stageAttrs.scaleY,
			stageAttrs,
			x: isNaN(x) ? stageRef.getPointerPosition().x : x,
			y: isNaN(y) ? stageRef.getPointerPosition().y : y
		});
		synced.nodes.push({
			type: draggedShape,
			x: isNaN(x) ? stageRef.getPointerPosition().x : x,
			y: isNaN(y) ? stageRef.getPointerPosition().y : y,
			fill: 'red'
		});
	}}
	class="relative bg-neutral-900"
	onscroll={(e) => {
		// console.log('scroll', e);
	}}
	ondragover={(e) => e.preventDefault()}
>
	<div class="absolute left-2 top-2 z-10 flex flex-col gap-2 border border-white/10 bg-black p-2">
		<div
			draggable="true"
			role="button"
			tabindex="0"
			class="cursor-grab"
			ondragstart={(e) => (draggedShape = 'circle')}
		>
			<svg class="h-10 w-10" viewBox="0 0 40 40" use:circle> </svg>
		</div>
		<div
			draggable="true"
			tabindex="0"
			role="button"
			class="cursor-grab"
			ondragstart={(e) => (draggedShape = 'rect')}
		>
			<svg class="h-10 w-10" viewBox="0 0 40 40" use:rect> </svg>
		</div>
	</div>
	<div class="absolute right-2 top-2 z-10 flex flex-col gap-2 border border-white/10 bg-black p-2">
		<div class="badge badge-warning gap-2">
			Online: {users}
		</div>
	</div>

	<Stage
		onwheel={(e) => {
			// stop default scrolling
			e.preventDefault();

			var oldScale = stageRef.scaleX();
			var pointer = stageRef.getPointerPosition();

			var mousePointTo = {
				x: (pointer.x - stageRef.x()) / oldScale,
				y: (pointer.y - stageRef.y()) / oldScale
			};

			// how to scale? Zoom in? Or zoom out?
			let direction = e.deltaY > 0 ? 1 : -1;

			// when we zoom on trackpad, e.evt.ctrlKey is true
			// in that case lets revert direction
			if (e.ctrlKey) {
				direction = -direction;
			}

			var newScale = direction > 0 ? oldScale * 1.05 : oldScale / 1.05;

			stageRef.scale({ x: newScale, y: newScale });

			var newPos = {
				x: pointer.x - mousePointTo.x * newScale,
				y: pointer.y - mousePointTo.y * newScale
			};
			stageRef.position(newPos);
		}}
		bind:handle={stageRef}
		config={{
			width: stageWidth,
			height: window.innerHeight * 0.75,
			draggable: true
		}}
	>
		<Layer>
			{#each synced.nodes as node, i}
				<Shape bind:node={synced.nodes[i]} />
			{/each}
		</Layer>
	</Stage>
</div>
