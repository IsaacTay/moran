<script lang="ts">
	let error = false

	const MIN_TEMP = 200
	const MAX_TEMP = 2250
	
	const T0 = 237.15
	let temp = T0
	let temp_kelvin = T0
	let pressure = 1
	
	let use_kelvin = true
	let use_bar = true

	import raw_data from "/src/MoranAir.csv?raw"
	let data = parseCSV(raw_data)
	let header = data[0]
	header.shift()
	normalizeData(data)

	$: error = temp_kelvin < MIN_TEMP || temp_kelvin > MAX_TEMP

	function submit() {
		
	}

	function kelvin_trigger(event: { currentTarget: { value: string; }; }) {
		let new_state: boolean = event.currentTarget.value == 'true'
		temp = Number((temp + (new_state ? T0: -T0)).toPrecision(10))
		use_kelvin = new_state
	}

	$: temp_kelvin = temp + (use_kelvin ? 0 : T0)

	function normalizeData(arr: any[]) {
		arr.shift()
		for (let i = 0; i < arr.length; i++) {
			for (let i2 = 0; i2 < arr[i].length; i2++) {
				arr[i][i2] = Number(arr[i][i2]);
			}
		}
	}

	function parseCSV(str: string) {
		var arr: any[] = [];
		var quote = false;  // 'true' means we're inside a quoted field

		// Iterate over each character, keep track of current row and column (of the returned array)
		for (var row = 0, col = 0, c = 0; c < str.length; c++) {
			var cc = str[c], nc = str[c+1];        // Current character, next character
			arr[row] = arr[row] || [];             // Create a new row if necessary
			arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

			// If the current character is a quotation mark, and we're inside a
			// quoted field, and the next character is also a quotation mark,
			// add a quotation mark to the current column and skip the next character
			if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

			// If it's just one quotation mark, begin/end quoted field
			if (cc == '"') { quote = !quote; continue; }

			// If it's a comma and we're not in a quoted field, move on to the next column
			if (cc == ',' && !quote) { ++col; continue; }

			// If it's a newline (CRLF) and we're not in a quoted field, skip the next character
			// and move on to the next row and move to column 0 of that new row
			if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

			// If it's a newline (LF or CR) and we're not in a quoted field,
			// move on to the next row and move to column 0 of that new row
			if (cc == '\n' && !quote) { ++row; col = 0; continue; }
			if (cc == '\r' && !quote) { ++row; col = 0; continue; }

			// Otherwise, append the current character to the current column
			arr[row][col] += cc;
		}
		return arr;
	}

	function binarySearch(ar, el) {
		var m = 0;
		var n = ar.length - 1;
		while (m <= n) {
			var k = (n + m) >> 1;
			var cmp = el - ar[k];
			if (cmp > 0) {
				m = k + 1;
			} else if(cmp < 0) {
				n = k - 1;
			} else {
				return k;
			}
		}
		return m - 1;
	}

	let answers: number[] = []
	$: {
		if (!error) {
			let idx = binarySearch(data.map(x => x[0]), temp_kelvin);
			let d_temp = temp_kelvin - data[idx][0]
			let new_answers = Array(5)
			for (let index = 1; index < data[0].length; index++) {
				new_answers[index-1] = data[idx][index] + (temp_kelvin == data[idx][0] ? 0: ((data[idx+1][index] - data[idx][index]) / (data[idx+1][0] - data[idx][0]) * d_temp))
			}
			answers = new_answers
		}
	}

	const zip = (a, b) => a.map((k: string, i: number) => ({"name": k, "answer": b[i]}));
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Travel reccomendations app" />
</svelte:head>

<section class="grow hero">
	<div class="flex grow h-full w-full justify-center items-center backdrop-blur-sm">
		<div class="flex w-full p-10 rounded-3xl justify-center items-center flex-col md:flex-row md:space-x-10 xl:flex-col space-y-5">
			<form on:submit|preventDefault={submit} class="form-control w-fit">
				<label class="label">
					<span class="label-text text-lg"><strong>Parameters</strong></span>
				</label>
				<div class="flex flex-col space-y-3 xl:flex-row xl:space-x-3 xl:space-y-0">
					<div class="input-group input-group-vertical w-full min-w-max">
						<span class="flex flex-row justify-start py-1">
							Temperature
							<div class="{error ? "visible": "invisible"} text-xs text-error mr-0 ml-auto">({MIN_TEMP} ≤ temp ≤ {MAX_TEMP})</div>
						</span>
						<input type="number" placeholder="Input temperature..." class="z-10 input input-bordered w-full {error ? "input-error" : ""} " bind:value={temp} />
						<span class="btn-group btn-group-horizontal w-full p-0 -mt-2 overflow-clip">
							<input type="radio" class="btn grow pt-2" on:change={kelvin_trigger} name="temp" data-title="K" value={true} bind:group={use_kelvin} />
							<input type="radio" class="btn grow pt-2" on:change={kelvin_trigger} name="temp" data-title="°C" value={false} bind:group={use_kelvin} />
						</span>
					</div>
					<div class="input-group input-group-vertical w-full min-w-max">
						<span class="py-1">Pressure</span>
						<input type="number" placeholder="1" class="z-10 input input-bordered w-full {error ? "input-error" : ""} " bind:value={pressure} />
						<span class="btn-group btn-group-horizontal w-full p-0 -mt-2 overflow-clip">
							<input type="radio" class="btn grow pt-2" name="pressure" data-title="bar" bind:group={use_bar} value={true} />
							<input type="radio" class="btn grow pt-2" name="pressure" data-title="atm" bind:group={use_bar} value={false} />
						</span>
					</div>
				</div>
			</form>
			<div class="grid grid-flow-col grid-rows-5 items-center xl:grid-flow-row xl:grid-cols-5 xl:grid-rows-2 gap-3 p-3 rounded-md bg-base-200">
				{#each header as name}
					<div class="p-3 w-full h-full text-accent">
						{name}
					</div>
				{/each}
				{#each answers as answer}
					<div class="w-56">
						<div class="input-group">
							<span class="w-full">{Number(answer.toPrecision(10))}</span>
							<button on:click={() => navigator.clipboard.writeText(Number(answer.toPrecision(10)).toString())} class="{false ? "tooltip tooltip-bottom": ""} btn" data-tip="Copied!">
								<svg id="i-clipboard" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-4 h-4" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
									<path d="M12 2 L12 6 20 6 20 2 12 2 Z M11 4 L6 4 6 30 26 30 26 4 21 4" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div class="flex grow h-full items-end">

	</div>
</section>

<style>
</style>