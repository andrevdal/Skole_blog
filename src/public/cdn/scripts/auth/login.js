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
function showLogin() {
	loginBox.style.display = "block";
	window.document.title = "Login";
}
function setCookie(name, value, days) {
	let expires = "";
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie =
		name + "=" + (value || "") + expires + "; path=/; Secure;SameSite=Strict;";
}

const login = document.querySelector(".login"),
	username = document.querySelector(".username"),
	password = document.querySelector(".password"),
	loginFeedback = document.querySelector(".loginFeedback"),
	loginButton = document.querySelector(".loginButtonMain"),
	loginBox = document.querySelector(".loginBox"),
	loginExit = document.querySelector(".x img"),
	url = new URL(window.location.href);

if (url.searchParams.get("login")) showLogin();
loginButton.addEventListener("click", showLogin);
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

	if (usernameLength > 0) {
		if (usernameLength < 21) {
			if (passwordLength > 5) {
				if (passwordLength < 99) {
					if (!usernameValue.includes(":")) {
						sha256(passwordValue).then(async (pass) => {
							const res = await fetch("/api/login", {
								headers: {
									authorization: `Basic ${btoa(
										`${usernameValue}:${pass}`
									)}`,
									"Content-Type": "application/json",
								},
							});
							const obj = await res.json();
							loginFeedback.innerHTML = `${obj.message}`;
							setCookie("token", `Bearer ${obj.token}`, 1);
						});
					} else {
						loginFeedback.innerHTML =
							"The username cannot include the `:` character";
						loginFeedback.classList.add("error");
					}
				} else
					loginFeedback.innerHTML =
						"Please select a password below 100 characters";
				loginFeedback.classList.add("error");
			} else
				loginFeedback.innerHTML =
					"Please select a password above 6 characters";
			loginFeedback.classList.add("error");
		} else
			loginFeedback.innerHTML =
				"Please select a username below 20 characters";
		loginFeedback.classList.add("error");
	} else loginFeedback.innerHTML = "Please select a username";
});
