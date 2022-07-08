<script lang="ts">
	export const ssr = false;
	import Chat from '$lib/components/Chat.svelte';
	import CreateSession from '$lib/components/CreateSession.svelte';

	import { peer, swapSession } from '$lib/gun';
	import { sessionListeners } from '$lib/session';
	import { connected, connectMetamask, walletAddress } from '$lib/stores/provider';

	$: isHost = $swapSession && $swapSession.host.walletAddress === $walletAddress;
	$: isPeer = !isHost || $swapSession.client !== undefined;
</script>

<main
	class="text-orange-600 flex flex-col p-10 w-screen min-h-screen items-center justify-center gap-5 font-serif bg-black"
>
	{#if !$connected}
		<h1 class="font-bold text-2xl">Connect Your Wallet To Start</h1>
		<button
			class="bg-orange-600 p-3 text-black hover:bg-orange-500 font-bold"
			on:click={connectMetamask}>Connect</button
		>
	{:else if $swapSession}
		<h1 class="font-bold text-2xl">Active Session</h1>
		<button
			on:click={() => {
				if ($sessionListeners) $sessionListeners();
				swapSession.set(null);
			}}
			class="bg-orange-600 p-3 text-black hover:bg-orange-500 font-bold">Close Session</button
		>
		{#if !$peer}
			<h3 class="text-xl">Swap Session Code:</h3>
			<span class="text-md font-extrabold bg-orange-600/10 p-3">{$swapSession.sessionID}</span>
		{/if}
		<h2>Is Host??: {isHost}</h2>
		<h2>Connected Pair???: {isPeer}</h2>
		<Chat />
	{:else}
		<CreateSession />
	{/if}
</main>
