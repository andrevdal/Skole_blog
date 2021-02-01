import fetch from "node-fetch";
import cryptojs from "crypto";

const crypto = cryptojs.webcrypto;

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

const baseURL = "http://localhost:5000";

const username = "Luca",
	password = "hunter2",
	hash = await sha256(password);
const res = await fetch(`${baseURL}/api/register`, {
	headers: {
		authorization: `Basic ${Buffer.from(`${username}:${hash}`).toString(
			"base64"
		)}`,
		"Content-Type": "application/json",
	},
});
console.log(JSON.stringify(await res.json(), null, 4));

console.log(res.status);