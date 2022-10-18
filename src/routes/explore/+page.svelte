<script lang="ts">
	import { fade, slide, fly, crossfade } from 'svelte/transition';
	import { user_prefs, locations, show_q, hide_q } from '../store.js'

	// let api_url = 'https://travel-api.fly.dev'
	let api_url = 'https://travel-radar.fly.dev:8081'
	// let api_url = 'http://127.0.0.1:8081'

	let i = 0
	let past_q:number[] = [];
	let promise = Promise.resolve()
	if ($locations.length == 0)
		promise = fetch(api_url).then(
			response => response.json().then(
				response => {
					for (let i = 0; i < response.length; i++) {
						if (i < 5)
							$show_q.push(i)
						else if (i < 10)
							$hide_q.push(i);
						$locations.push({
							index: i,
							location: response[i][0],
							description: response[i][1],
							image: response[i][2],
							rating: response[i][3],
							more_details: response[i][4],
							clicked: false,
							offset: 0,
							drag: 0
						})
					}

					let a = fetch(api_url, {
						method: 'POST',
						body: JSON.stringify($user_prefs),
					}).then(response => response.json().then(
						response => update(response)
					));
					}
			)
		).catch(err => {
			for (let i = 0; i < 10; i++) {
				if (i < 5)
					$show_q.push(i)
				else if (i < 10)
					$hide_q.push(i);
				$locations.push({
					index: i,
					location: i,
					description: i,
					image: "",
					rating: 0,
					more_details: [],
					clicked: false,
					offset: 0,
					drag: 0
				})
			}
		})


	function argMax(array:any[]) {
		return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
	}

	function update(response:any) {
		for (let i = 0; i < $locations.length; i++) {
			if (!$locations[i].clicked) {
				$locations[i].offset = 80 * response[$locations[i].location]
			}
		}

		if ($hide_q.length == 0) {
			console.log("No more to show")
			return;
		}
		let next = argMax($hide_q.map(x => $locations[x].offset))
		$show_q.push($hide_q[next])
		$hide_q.splice(next, 1)

		//find the index of next best location
		let locations_left = $locations.filter(x => !x.clicked && !$show_q.includes(x.index) && !$hide_q.includes(x.index))
		if (locations_left.length == 0) {
			console.log("No more left")
			return;
		}
		next = argMax(locations_left.map(x => x.offset))
		$hide_q.push(locations_left[next].index)
	}

	function vote(up:boolean, index:number) {
		show_info = false
		let past = $show_q.splice($show_q.indexOf(index), 1)
		past_q.push.apply(past_q, past)
		if ($locations[index].clicked) {
			$locations[index].clicked = false
		} else {
			$locations[index].offset = 50 * (up ? 1 : -1)
			$locations[index].clicked = true
		}
		for (let i = 0; i < 2; i++) {
			if ($user_prefs[i].includes($locations[index].location)) {
				$user_prefs[i].splice($user_prefs[i].findIndex(x => x == $locations[index].location), 1)
			}
		}
		if ($locations[index].clicked)
			$user_prefs[up ? 0 : 1].push($locations[index].location)
		let a = fetch(api_url, {
			method: 'POST',
			body: JSON.stringify($user_prefs),
		}).then(response => response.json().then(
			response => update(response)
		));
	}

	let triggered = false;
	let reset = true;
	let origin = 0;
	let prev = 0;
	function triggerDown() {
		triggered = true;
		reset = true;
		origin = 0;
	}
	function triggerUp() {
		triggered = false;
		reset = true;
		origin = 0;
	}
	
	let eve:any = 0;

	function cardMove(event: PointerEvent) {
		eve = origin
		if (!triggered)
			return;
		if (reset) {
			prev = event.x;
			reset = false;
			return
		}
		origin += event.x - prev;
		prev = event.x;
		let threshold = origin / (window.screen.width / 4);
		if (Math.abs(threshold) > 1) {
			vote(threshold > 0, $show_q[0]);
			triggerUp();
		}
	}

	let show_info = false;
	let show_index = 0;
	function cardClick(index:number) {
		show_info = true;
		show_index = index;
	}

	function cardDismiss() {
		show_info = false;
	}

	const [send, receive] = crossfade({
		duration:1500
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Travel reccomendations app" />
</svelte:head>

<section class="w-full overflow-x-hidden">
	{#await promise then}
		<div class="bg-black bg-opacity-20 backdrop-blur-md z-50 fixed w-screen h-screen lg:flex hidden transition-opacity {show_info ? "opacity-100" : "opacity-0"}" style="pointer-events: {show_info ? "all": "none"}">
			<div on:click={cardDismiss} class="fixed w-screen h-screen"></div>
			<div class="card rounded-2xl card-side w-2/3 h-2/3 top-[16.666%] left-[16.666%] bg-base-100">
				<figure class="card-image h-0 min-h-full w-1/2 overflow-clip">
					<img alt="Larger image of {$locations[show_index].location}}" src={$locations[show_index].image} class="object-cover h-full w-screen"/>
				</figure>
				<div class="prose m-3 card-body flex grow-0">
					<h3 class="card-title">{$locations[show_index].location}</h3>
					<p class="card-text">{$locations[show_index].description}</p>
					<article>
						{#each $locations[show_index].more_details as deets}
							<li class="card-text">{deets}</li>
						{/each}
					</article>
				</div>
			</div>
		</div>
	{/await}
	<div class="h-full w-full lg:p-0 lg:pt-32 pt-24 p-5 grid justify-center lg:flex flex-col lg:space-y-3 overflow-clip" on:pointerleave={triggerUp} on:mouseleave={triggerUp} on:pointerup={triggerUp} on:mouseup={triggerUp}>
		<div class="absolute left-0 w-1/4 inset-y-0 cursor-pointer visible lg:hidden from-warning bg-gradient-to-r z-50 pointer-events-none {triggered ? "": "transition-all"}" style="opacity:{Math.min(-origin/3, 70)}%" />
		<div class="absolute right-0 w-1/4 inset-y-0 cursor-pointer visible lg:hidden from-success bg-gradient-to-l z-50 pointer-events-none {triggered ? "": "transition-all"}" style="opacity:{Math.min(origin/3, 70)}%" />
		<div class="fixed top-20 w-full h-8 hidden lg:grid px-5 -z-50">
			<div class="row-start-1 col-start-1 px-5 h-full from-warning to-success bg-gradient-to-r w-full rounded-xl via-transparent opacity-70 -z-10" />
			<div class="row-start-1 col-start-1 px-5 h-full w-full flex items-center flex-row">
				<p class="w-full">Dislike</p>
			<p class="">Like</p>
			</div>
		</div>
		{#await promise}
			{#each [1, 2, 3, 4, 5] as i}
				<div class="lg:flex {i < 2 ? "inline-flex " + (i == 0 ? "z-50": "z-40") : "inline-flex z-30"} w-full row-start-1 col-start-1" transition:fade>
					<div class="hidden lg:flex" style="width:50%" transition:fade></div>
					<div class="mx-5 card border border-base-content flex-col-reverse lg:card-side max-w-2xl lg:shadow-md bg-base-200 ">
						<div class="card-body flex lg:order-2 grow-0">
							<h3 class="card-title bg-neutral text-transparent animate-pulse rounded-md">Location Title</h3>
							<p class="card-text text-transparent bg-neutral animate-pulse rounded-md">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
							<p class="lg:visible hidden self-end text-neutral">More info...</p>
							<div class="flex row w-full">
								<btn class="z-10 grow lg:hidden flex btn btn-warning">👎</btn>
								<btn class="z-10 grow  lg:hidden flex btn">More info</btn>
								<btn class="z-10 grow lg:hidden flex btn btn-success">👍</btn>
							</div>
						</div>
						<figure class="card-image h-0 min-h-full lg:w-1/4 overflow-clip">
							<img alt="" class="object-cover h-screen w-screen bg-neutral animate-pulse"/>
						</figure>
					</div>
					<div class="lg:flex hidden cursor-pointer opacity-0 transition-all" style="width:50%"></div>
				</div>
			{/each}
		{:then}
			{#each $locations as {location, description, image, offset, index, clicked}}
			<div class="lg:flex lg:opacity-100 {($user_prefs[0].includes(location) || $user_prefs[1].includes(location) || $show_q.includes(index)) ? "inline-flex opacity-100 " + (($user_prefs[0].includes(location) || $user_prefs[1].includes(location)) ? "z-30" : (index == $show_q[0] ? "z-20": (index == $show_q[1] ? "z-10" : "z-0"))) : "hidden opacity-0 z-0"} w-full row-start-1 col-start-1 transition-opacity lg:pointer-events-auto {index == $show_q[0] ? "pointer-events-auto": "pointer-events-none"} touch-none" in:fly="{{duration:$show_q.includes(index)?1000:0, x:5000 * (index % 2 ? 1 : -1), delay:100 * $show_q.findIndex(x => x == index)}}">
				<btn on:click={vote(false, index)} class="cursor-pointer hidden lg:flex opacity-0 hover:opacity-30 {clicked ? "from-gray-500": "from-warning"} bg-gradient-to-r transition-all" style="width:{50+offset}%"></btn>
				<div class="mx-5 card border border-base-content flex-col-reverse lg:card-side max-w-2xl lg:shadow-md {index == $show_q[0]  ? "shadow-md" : ""} bg-base-200 {triggered ? "": "transition-all webkit-transition-all"} {$user_prefs[0].includes(location) ? "translate-x-screen": ($user_prefs[1].includes(location) ?"-translate-x-screen" : "")} lg:translate-x-none" style={index == $show_q[0] ? "transform:translate("+origin+"px);-webkit-transform: translate("+origin+"px);": ""} >
					<div on:pointerdown={triggerDown} on:mousedown={triggerDown} on:pointerleave={triggerDown} on:pointermove={(event)=>cardMove(event)} class="cursor-grab active:cursor-grabbing lg:hidden absolute min-w-full min-h-full" />
					<div on:click={() => cardClick(index)} class="cursor-pointer lg:flex hidden absolute min-w-full min-h-full" />
					<div class="card-body flex lg:order-2 grow-0">
						<h3 class="card-title">{location}</h3>
						<p class="card-text">{description}</p>
						{#if show_info && index == show_index}
						<article class="lg:hidden" transition:slide>
							{#each $locations[index].more_details as deets}
								<li class="card-text">{deets}</li>
							{/each}
						</article>
						{/if}
						<p class="lg:flex hidden text-neutral self-end">More info...</p>
						<div class="flex row w-full btn-group">
							<btn on:click|stopPropagation={vote(false, index)} class="z-10 grow lg:hidden flex btn btn-warning">👎</btn>
							<btn on:click|stopPropagation={() => (show_info ? cardDismiss() : cardClick(index))} class="z-10 grow lg:hidden flex btn">{(show_info && index == show_index) ? "Less info" : "More info"}</btn>
							<btn on:click|stopPropagation={vote(true, index)} class="z-10 grow lg:hidden flex btn btn-success">👍</btn>
						</div>
					</div>
					<figure class="card-image h-0 min-h-full lg:w-1/4 overflow-clip">
						<img alt="Image of {location}" src={image} class="object-cover h-full w-screen"/>
					</figure>
				</div>
				<btn on:click={vote(true, index)} class="lg:flex hidden cursor-pointer opacity-0 hover:opacity-30 {clicked ? "from-gray-500" : "from-success"} bg-gradient-to-l transition-all" style="width:{50-offset}%"></btn>
			</div>
			{/each}
		{/await}
	</div>
</section>

<style>
</style>