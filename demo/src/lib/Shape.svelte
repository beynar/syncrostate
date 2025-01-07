<script lang="ts">
	import { Image as KonvaImage } from 'svelte-konva';
	import { createImage, createRect } from './canvas.svelte';

	let {
		node = $bindable()
	}: {
		node: {
			type: 'circle' | 'rect';
			x: number;
			y: number;
			fill: string;
		};
	} = $props();

	const image = createImage(node.type, 100);
</script>

<KonvaImage
	on:dragend={(e) => {
		console.log('dragend', e.detail);
		var stageAttrs = e.detail.currentTarget.parent?.parent?.attrs;
		console.log({ stageAttrs }, e.detail.currentTarget.parent);

		const { x, y } = e.detail.currentTarget.getAbsolutePosition();

		var newX = (x - (stageAttrs.x || 0)) / (stageAttrs.scaleX || 1);
		var newY = (y - (stageAttrs.y || 0)) / (stageAttrs.scaleY || 1);
		node = {
			...node,
			x: newX,
			y: newY
		};
	}}
	config={{
		draggable: true,
		x: node.x,
		y: node.y,
		width: 100,
		height: 100,
		scaleX: 1,
		scaleY: 1,
		image: image,
		offsetX: 50,
		offsetY: 50
	}}
/>
