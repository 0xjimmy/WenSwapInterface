<script lang="ts">
	export const ssr = false;
	import { createSession, joinSession } from '$lib/session';
	let joinCodeInput = '';
</script>

<div class="flex gap-3 flex-wrap">
	<div
		class="gap-6 bg-orange-600/10 rounded-md w-80 h-80 flex flex-col items-center justify-center"
	>
		<h1 class="font-bold text-2xl">Create New</h1>
		<button
			class="bg-orange-600 p-3 text-black hover:bg-orange-500 font-bold"
			on:click={createSession}>Start</button
		>
	</div>
	<div
		class="gap-6 bg-orange-600/10 rounded-md w-80 h-80 flex flex-col items-center justify-center"
	>
		<h1 class="font-bold text-2xl">Join Existing</h1>
		<input
			bind:value={joinCodeInput}
			type="text"
			class="bg-black p-3"
			placeholder="Enter Session Code"
		/>
		<button
			class="bg-orange-600 p-3 text-black hover:bg-orange-500 font-bold"
			on:click={() => joinSession(joinCodeInput)}>Join</button
		>
	</div>
</div>
