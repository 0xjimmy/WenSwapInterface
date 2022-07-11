<script lang="ts">
	import { encryptionKey, peer } from '$lib/gun';

	export const ssr = false;
	import Chat from './Chat.svelte';
</script>

<p>Peer: {JSON.stringify($peer)}</p>

{#if $encryptionKey}
	<div class="flex gap-3 flex-wrap">
		<div
			class="gap-6 bg-orange-600/10 rounded-md w-80 h-80 flex flex-col items-center justify-center"
		>
			<h1 class="font-bold text-2xl">Your Items To Offer</h1>
			<button class="bg-orange-600 p-3 text-black hover:bg-orange-500 font-bold">Add Item</button>
		</div>
		<div
			class="gap-6 bg-orange-600/10 rounded-md w-80 h-80 flex flex-col items-center justify-center"
		>
			<h1 class="font-bold text-2xl">Items offered in exchange</h1>
		</div>
		<Chat />
	</div>
{/if}
