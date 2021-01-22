import cryptoJs from "https://cdn.skypack.dev/crypto-js";
const register = document.querySelector(".register"),
	username = document.querySelector(".username"),
	password = document.querySelector(".password"),
	registerFeedback = document.querySelector(".registerFeedback");

register.addEventListener("onSubmit", (event) => {
	const usernameValue = username.value;
	const passwordValue = password.value;
	let passwordLength = passwordValue.length;
	let usernameLength = usernameValue.length;

	if (usernameLength > 0) {
		if (usernameLength < 21) {
			if (passwordLength > 5) {
				if (passwordLength < 99) {
					const salt = cryptoJs.lib.WordArray.random(128 / 8);
					fetch(`/auth/register`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							username,
							hash: cryptoJs.PBKDF2(password, salt).toString(),
							salt,
						}),
					})
						.then((res) => res.json())
						.then(
							(obj) => (registerFeedback.innerHTML = obj.message),
						)
						.then((_) => (window.location.href = ""))
						.catch(
							(err) =>
								(registerFeedback.innerHTML = `Something went wrong ${err}`),
						);
				} else {
					registerFeedback.innerHTML =
						"Please select a password below 100 characters";
				}
			} else {
				registerFeedback.innerHTML =
					"Please select a password above 6 characters";
			}
		} else {
			registerFeedback.innerHTML =
				"Please select a username below 20 characters";
		}
	} else {
		registerFeedback.innerHTML = "Please select a username";
	}
});
