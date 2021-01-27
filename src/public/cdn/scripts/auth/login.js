async function sha256(message) {
	// encode as UTF-8
	const msgBuffer = new TextEncoder().encode(message);
	// hash the message
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
	// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	// convert bytes to hex string
	const hashHex = hashArray
		.map((b) => ("00" + b.toString(16)).slice(-2))
		.join("");
	return hashHex;
}
const login = document.querySelector(".login"),
	username = document.querySelector(".username"),
	password = document.querySelector(".password"),
	loginFeedback = document.querySelector(".loginFeedback"),
	loginButton = document.querySelector(".loginButtonMain"),
	loginBox = document.querySelector(".loginBox"),
	loginExit = document.querySelector(".x img");

loginButton.addEventListener("click", () => {
	loginBox.style.display = "block";
	window.document.title = "Login";
});
loginExit.addEventListener("click", () => {
	loginBox.style.display = "none";
	window.document.title = "Home";
});
login.addEventListener("submit", (e) => {
	e.preventDefault();
	const usernameValue = username.value,
		passwordValue = password.value,
		passwordLength = passwordValue.length,
		usernameLength = usernameValue.length;

	if (usernameLength > 0){
		if (usernameLength < 21){
			if (passwordLength > 5){
				if (passwordLength < 99){
					if (!passwordValue.includes(":"))
						sha256(passwordValue).then((pass) =>
							fetch("/api/login", {
								headers: {
									authorization: `Basic ${btoa(
										`${usernameValue}:${pass}`
									)}`,
									"Content-Type": "application/json",
								},
							})
								.then((res) => res.json())
								.then(
									(res) =>
										(loginFeedback.innerHTML = `${res.message}`)
								)
						);}
					else
						loginFeedback.innerHTML =
							"Please select a password below 100 characters";}
				else
					loginFeedback.innerHTML =
						"Please select a password above 6 characters";}
			else
				loginFeedback.innerHTML =
					"Please select a username below 20 characters";}
		else loginFeedback.innerHTML = "Please select a username";
});
