<script lang="ts">
	export const ssr = false;
	import { chatMessages, sendMessage } from '$lib/chat';

	let chatInput = '';

	const chat = () => {
		sendMessage(chatInput);
		chatInput = '';
	};
</script>

<div class="flex flex-col gap-3 max-w-md">
	{#each Object.values($chatMessages) as chat}
		<div class="bg-gray-900 rounded-md p-3 w-full text-white">
			<p>From: {chat.from}, message: {chat.message}</p>
		</div>
	{/each}
	<form on:submit|preventDefault={chat}>
		<input
			class="bg-black border-orange-600 border-2 p-3 w-full"
			bind:value={chatInput}
			type="text"
			placeholder="Send Message"
		/>
	</form>
</div>
