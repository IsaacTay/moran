<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';
</script>

<div class="flex flex-col max-h-screen min-h-screen">	
	<!-- <div class="top-0 fixed w-full z-50 p-5">
		<Header />
	</div> -->

	<main class="flex grow">
		<slot />
	</main>
</div>