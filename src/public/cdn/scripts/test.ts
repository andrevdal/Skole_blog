document
	.querySelector("button")!
	.addEventListener("click", async (e: Event) => {
		const res = await fetch("/api/resources");
		document.querySelector("#output")!.innerHTML = JSON.stringify(
			await res.json(),
			null,
			4
		);
	});
