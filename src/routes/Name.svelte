<script lang="ts">
	let {
		name
	}: {
		name: string;
	} = $props();

	$inspect({ name });
</script>

<div>{name}</div>
