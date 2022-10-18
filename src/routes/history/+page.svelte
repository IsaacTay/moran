<script lang="ts">
	let likes = 0
	let dislikes = 0
	let per_likes = 0
	let per_dislikes = 0
	let length = 0
	let per_answered = 0

	$: {
		likes = $user_prefs[0].length
		dislikes = $user_prefs[1].length
		length = $locations.length
		if (length !== 0) {
			per_likes = likes * 100 / length
			per_dislikes = dislikes * 100 / length
			per_answered = Math.round((likes + dislikes) * 100 / length)
		} else {
			per_likes = 0
			per_dislikes = 0
			per_answered = 0
		}
	}
</script>

<svelte:head>
	<title>History</title>
	<meta name="description" content="Show what you liked in the past" />
</svelte:head>

<div class="pt-20 p-7 w-full">
	<div class="w-full">
		<div class="stats z-10 shadow fixed top-15 inset-x-0 mx-6">
			<div class="stat">
				<div class="stat-figure text-primary">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
				</div>
				<div class="stat-title">Likes</div>
				<div class="stat-value text-primary">{likes}</div>
				<div class="stat-desc">{per_likes}% of the locations </div>
			</div>
			
			<div class="stat">
				<div class="stat-figure text-secondary">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
				</div>
				<div class="stat-value">{per_answered}%</div>
				<div class="stat-title">Locations Rated</div>
				<div class="stat-desc">{length - likes - dislikes} places remaining</div>
			</div>
			
		</div>
		<div class="p-5 pt-32 gap-4 w-full grid grid-flow-row lg:grid-cols-3 grid-cols-1">
		{#each $locations.filter(x => $user_prefs[0].includes(x.location)) as {location, description, more_details, image, rating}, index}
		<div class="mx-5 card border border-base-content max-w-2xl shadow-md bg-base-200 ">
			<figure class="card-image h-32 overflow-clip">
				<img alt="{location}" src={image} class="object-cover h-0 min-h-full w-screen"/>
			</figure>
			<div class="card-body flex grow-0">
				<h3 class="card-title">{location}</h3>
				<p class="card-text">{description}</p>
				<article>
					{#each more_details as deets}
						<li class="card-text">{deets}</li>
					{/each}
				</article>
			</div>	
		</div>
		{/each}
		</div>
	</div>
</div>

<style>
</style>
