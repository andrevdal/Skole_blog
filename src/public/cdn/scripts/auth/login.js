import cryptoJs from "https://cdn.skypack.dev/crypto-js";
const login = document.querySelector(".login"),
	username = document.querySelector(".username"),
	password = document.querySelector(".password"),
	loginFeedback = document.querySelector(".loginFeedback");

login.addEventListener("onSubmit", (event) => {
	const usernameValue = username.value;
	const passwordValue = password.value;
	let passwordLength = passwordValue.length;
	let usernameLength = usernameValue.length;

	if (usernameLength > 0) {
		if (usernameLength < 21) {
			if (passwordLength > 5) {
				if (passwordLength < 99) {
					const salt = cryptoJs.lib.WordArray.random(128 / 8);
					fetch(`/auth/login`, {
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
						.then((obj) => (loginFeedback.innerHTML = obj.message))
						.then((_) => (window.location.href = ""))
						.catch(
							(err) =>
								(loginFeedback.innerHTML = `Something went wrong ${err}`),
						);
				} else {
					loginFeedback.innerHTML =
						"Please select a password below 100 characters";
				}
			} else {
				loginFeedback.innerHTML =
					"Please select a password above 6 characters";
			}
		} else {
			loginFeedback.innerHTML =
				"Please select a username below 20 characters";
		}
	} else {
		loginFeedback.innerHTML = "Please select a username";
	}
});
