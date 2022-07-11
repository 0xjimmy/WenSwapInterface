<script lang="ts">
	export const ssr = false;
	import CreateSession from '$lib/components/CreateSession.svelte';
	import SwapSession from '$lib/components/SwapSession.svelte';

	import Planet from '$lib/assets/planet.svg';
	import { connected, connectMetamask } from '$lib/stores/provider';
	import { sessionID, sessionListeners, sessionSig } from '$lib/gun';
</script>

<header class="w-screen p-3 py-12 bg-black text-orange-600 flex gap-3 items-center justify-around">
	<h1 class="font-extrabold text-3xl text-white font-sans flex items-center gap-1">
		WenSwap <img class="h-16 pointer-events-none" src={Planet} alt="🪐" />
	</h1>
	{#if $sessionID}
		<div
			class="
      flex
      "
		>
			<div class="text-md font-extrabold bg-orange-400/10 p-3 w-max flex items-center-center gap-2">
				<span class="font-medium">Session Code:</span>
				<span>{$sessionID}</span>
			</div>
			<button
				on:click={() => {
					if ($sessionListeners) $sessionListeners();
					sessionID.set(null);
					sessionSig.set(null);
				}}
				class="bg-orange-600 p-3 text-md text-black hover:bg-orange-500 font-bold"
				>Close Session</button
			>
		</div>
	{/if}
</header>
<main
	class="text-orange-600 flex flex-col p-10 w-screen min-h-screen items-center justify-start gap-5 font-serif bg-black"
>
	{#if !$connected}
		<h1 class="font-bold text-2xl">Connect Your Wallet To Start</h1>
		<button
			class="bg-orange-600 p-3 text-black hover:bg-orange-500 font-bold"
			on:click={connectMetamask}>Connect</button
		>
	{:else if $sessionID}
		<SwapSession />
	{:else}
		<CreateSession />
	{/if}
</main>
