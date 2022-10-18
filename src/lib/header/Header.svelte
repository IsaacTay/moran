<script lang="ts">
	import { page } from '$app/stores';
	import logo from './svelte-logo.svg';

	const navs = [
		{
			"label": "Home",
			"href": "/"
		},
		{
			"label": "Explore",
			"href": "/explore"
		},
		{
			"label": "History",
			"href": "/history"
		},
	]
</script>

<header>
	<div class="navbar rounded-lg bg-base-200 shadow-lg">
		<div class="navbar-start">
			<div class="dropdown">
				<label tabindex="0" class="btn btn-ghost lg:hidden">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
				</label>
				<ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
					{#each navs as {label, href}}
					<li class:active={$page.url.pathname === href}><a sveltekit:prefetch href={href}>{label}</a></li>
					{/each}
				</ul>
			</div>
			<a class="btn btn-ghost normal-case text-xl" href="/">Travel App</a>
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal p-0">
				{#each navs as {label, href}}
					<li class:active={$page.url.pathname === href}><a sveltekit:prefetch href={href}>{label}</a></li>
				{/each}
			</ul>
		</div>
		<div class="navbar-end">
			<a class="btn" sveltekit:prefetch href="/login">Log In</a>
		</div>
	</div>
</header>

<style>
	/* header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	} */
</style>
