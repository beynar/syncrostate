<script lang="ts">
	let {
		mark,
		key
	}: {
		mark: string;
		key: string;
	} = $props();

	$inspect({ mark });
	$inspect({ key });
</script>

<div>{mark}</div>
<div>{key}</div>
