const login = document.querySelector(".loginButton");
const username = document.querySelector(".username");
const password = document.querySelector(".password");
const loginFeedback = document.querySelector(".loginFeedback")
const loginButton = document.querySelector(".loginButtonMain")
const loginBox = document.querySelector(".loginBox")
const loginExit = document.querySelector(".x img")

loginButton.addEventListener("click", () => {
	loginBox.style.display = "block";
	window.document.title = "Login"
})
loginExit.addEventListener("click", () => {
	loginBox.style.display = ("none")
	window.document.title = "Home"
})

login.addEventListener("click", (verification) => {
	const usernameValue = username.value;
	const passwordValue = password.value;
	let passwordLength = passwordValue.length;
	let usernameLength = usernameValue.length;

	if (usernameLength > 0) {
		if (usernameLength < 21) {
			if (passwordLength > 5) {
				if (passwordLength < 99) {
					loginBox.style.display = "none"
					window.document.title = "Home"
				} else {
					loginFeedback.innerHTML = "Please select a password below 100 characters"
					loginFeedback.classList.add('error');
				}
			} else {
				loginFeedback.innerHTML = "Please select a password above 6 characters"
				loginFeedback.classList.add('error');
			}
		} else {
			loginFeedback.innerHTML = "Please select a username below 20 characters"
			loginFeedback.classList.add('error');
		}
	} else {
		loginFeedback.innerHTML = "Please select a username"
		loginFeedback.classList.add('error');
	}
});