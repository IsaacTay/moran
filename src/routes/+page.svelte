<script lang="ts">
	let error = false
	
	const T0 = 237.15
	let temp = T0
	let temp_kelvin = T0
	let pressure = 1
	
	let use_kelvin = true
	let use_bar = true

	import raw_data from "/src/AirPropertiesTable.csv?raw"
	let data = parseCSV(raw_data)
	let header = data[0]
	header.shift()
	normalizeData(data)

	$: error = temp_kelvin < 200 || temp_kelvin > 740

	function submit() {
		
	}

	function kelvin_trigger(event: { currentTarget: { value: string; }; }) {
		let new_state: boolean = event.currentTarget.value == 'true'
		temp += new_state ? T0: -T0
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

	let answers: number[] = []
	$: {
		if (!error) {
			console.log(temp_kelvin)
			let idx = (temp_kelvin - 200) / 10;
			let i1 = Math.floor(idx)
			let i2 = Math.ceil(idx)
			let dt = data[i2][0] - data[i1][0]
			let d_temp = temp_kelvin - data[i1][0] / dt
			let new_answers = Array(5)
			for (let index = 1; index < data[0].length; index++) {
				new_answers[index-1] = data[i1][index] + (i1 == i2 ? 0: (data[i2][index] - data[i1][index]) / dt * d_temp)
			}
			answers = new_answers
		}
	} 
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Travel reccomendations app" />
</svelte:head>

<section class="grow hero">
	<div class="flex grow h-full w-full justify-center items-center backdrop-blur-sm">
		<div class="flex w-full p-10 rounded-3xl justify-center items-center flex-col">
			<form on:submit|preventDefault={submit} class="form-control w-full max-w-sm">
				<label class="label">
					<span class="label-text text-lg"><strong>Parameters</strong></span>
				</label>
				<div class="flex flex-row space-x-3">
					<div class="input-group input-group-vertical">
						<span>Temperature</span>
						<input type="number" placeholder="Input temperature..." class="z-10 input input-bordered w-full {error ? "input-error" : ""} " bind:value={temp} />
						<span class="btn-group btn-group-horizontal w-full p-0 -mt-2 overflow-clip">
							<input type="radio" class="btn grow pt-2" on:change={kelvin_trigger} name="temp" data-title="K" value={true} bind:group={use_kelvin} />
							<input type="radio" class="btn grow pt-2" on:change={kelvin_trigger} name="temp" data-title="°C" value={false} bind:group={use_kelvin} />
						</span>
					</div>
					<div class="input-group input-group-vertical">
						<span>Pressure</span>
						<input type="number" placeholder="1" class="z-10 input input-bordered w-full {error ? "input-error" : ""} " bind:value={pressure} />
						<span class="btn-group btn-group-horizontal w-full p-0 -mt-2 overflow-clip">
							<input type="radio" class="btn grow pt-2" name="pressure" data-title="bar" bind:group={use_bar} value={true} />
							<input type="radio" class="btn grow pt-2" name="pressure" data-title="atm" bind:group={use_bar} value={false} />
						</span>
					</div>
				</div>
			</form>
			<span class="py-10">
			<table class="table w-full">
				<!-- head -->
				<thead>
				<tr>
					{#each header as name}
						<th>{name}</th>
					{/each}
				</tr>
				</thead>
				<tbody>
				<tr>
					{#each answers as answer}
						<td class="w-56">
							<div class="input-group">
								<span class="w-full">{Number(answer.toPrecision(10))}</span>
								<button on:click={() => navigator.clipboard.writeText(Number(answer.toPrecision(10)).toString())} class="{false ? "tooltip tooltip-bottom": ""} btn" data-tip="Copied!">
									<svg id="i-clipboard" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-4 h-4" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
										<path d="M12 2 L12 6 20 6 20 2 12 2 Z M11 4 L6 4 6 30 26 30 26 4 21 4" />
									</svg>
								</button>
							</div>
						</td>
					{/each}
				</tr>
			</table>
		</div>
	</div>
	<div class="flex grow h-full items-end">

	</div>
</section>

<style>
</style>