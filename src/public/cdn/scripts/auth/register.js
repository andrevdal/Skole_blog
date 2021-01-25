const register = document.querySelector(".register"),
	username = document.querySelector(".username"),
	password = document.querySelector(".password"),
	registerFeedback = document.querySelector(".registerFeedback");

register.addEventListener("submit", (e) => {
	e.preventDefault();
	const usernameValue = username.value,
		passwordValue = password.value,
		passwordLength = passwordValue.length,
		usernameLength = usernameValue.length;

	if (usernameLength > 0)
		if (usernameLength < 21)
			if (passwordLength > 5)
				if (passwordLength < 99) {
					const salt = CryptoJS.lib.WordArray.random(
						128 / 8
					).toString();
					fetch(`/auth/register`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							username: usernameValue,
							hash: CryptoJS.PBKDF2(
								passwordValue,
								salt
							).toString(),
							salt,
						}),
					})
						.then((res) => res.json())
						.then(
							(obj) => (registerFeedback.innerHTML = obj.message)
						)
						//.then(() => (window.location.href = ""))
						.catch(
							(err) =>
								(registerFeedback.innerHTML = `Something went wrong ${err}`)
						);
				} else
					registerFeedback.innerHTML =
						"Please select a password below 100 characters";
			else
				registerFeedback.innerHTML =
					"Please select a password above 6 characters";
		else
			registerFeedback.innerHTML =
				"Please select a username below 20 characters";
	else registerFeedback.innerHTML = "Please select a username";
});
