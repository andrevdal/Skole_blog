function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie =
		name + "=" + (value || "") + expires + "; path=/; Secure;";
}
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
const login = document.querySelector(".login");
const username = document.querySelector(".username");
const password = document.querySelector(".password");
const loginFeedback = document.querySelector(".loginFeedback");
const loginBox = document.querySelector(".loginBox");
const loginExit = document.querySelector(".x img");
const retypePassword = document.querySelector(".retypePassword");
const loginButton = document.querySelector(".loginButtonMain");

loginButton.addEventListener("click", () => {
	window.location.href = "/login";
});
loginExit.addEventListener("click", () => {
	loginBox.style.display = "none";
	window.document.title = "Home";
});

login.addEventListener("submit", (e) => {
	e.preventDefault();
	const usernameValue = username.value;
	const passwordValue = password.value;
	const passwordLength = passwordValue.length;
	const usernameLength = usernameValue.length;
	const retypePasswordValue = retypePassword.value;

	if (usernameLength > 0) {
		if (usernameLength < 21) {
			if (passwordLength > 5) {
				if (passwordLength < 99) {
					if (retypePasswordValue == passwordValue) {
						if (!usernameValue.includes(":")) {
							sha256(passwordValue).then(async (pass) => {
								const res = await fetch("/api/register", {
									method: "POST",
									headers: {
										authorization: `Basic ${btoa(
											`${usernameValue}:${pass}`
										)}`,
										"Content-Type": "application/json",
									},
								});
								const obj = await res.json();
								loginFeedback.innerHTML = obj.message;
								if (res.ok) {
									window.location.href =
										"/login?login=true";
								} else {
									loginFeedback.classList.add("error");
									setCookie(
										"token",
										`Bearer ${obj.token}`,
										1
									);
								}
							});
						} else {
							loginFeedback.innerHTML =
								"The username cannot include the `:` character";
							loginFeedback.classList.add("error");
						}
					} else {
						loginFeedback.innerHTML = "Passwords need to match";
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
