import cryptoJs from "crypto-js";
import fetch from "node-fetch";
const baseURL = "http://localhost:5000";

const username = "Luca",
	password = "hunter2",
	salt = cryptoJs.lib.WordArray.random(128 / 8).toString();

const res = await fetch(`${baseURL}/auth/register`, {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		username,
		hash: cryptoJs.PBKDF2(password, salt).toString(),
		salt,
	}),
});

console.log(await res.text());
console.log(res.status);
