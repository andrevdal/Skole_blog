const fetch = require("node-fetch");
const settings = require("./settings.json");
const { sha256 } = require("../src/utils/common");

/**
 * Register a new user
 * @param {String} username What username will be used when making a new account
 * @param {String} password The password of this account
 * @returns {Promise<any>} The server's response
 */
async function register(username, password) {
	hash = await sha256(password);
	const res = await fetch(`${settings.base_url}/register`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(
				`${username}:${hash}`,
				"utf-8"
			).toString("base64")}`,
		},
	});
	if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
	return await res.json();
}

/**
 * Login in the website
 * @param {String} username The account's username
 * @param {String} password The account's password
 * @returns {Promise<any>} The server's response
 */
async function login(...args) {
	if (args.length != 1) {
		hash = await sha256(args[1]);
		const res = await fetch(`${settings.base_url}/login`, {
			headers: {
				Authorization: `Basic ${Buffer.from(
					`${args[0]}:${hash}`,
					"utf-8"
				).toString("base64")}`,
			},
		});
		if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
		return await res.json();
	} else {
		const res = await fetch(`${settings.base_url}/login`, {
			headers: {
				Authorization: `Bearer ${args[0]}`,
			},
		});
		if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
		return await res.json();
	}
}

/**
 * Get a user
 * @param {String | Number} username The account's username or ID
 * @returns {Promise<any>} The user object. If no user is provided it will return a list of all the users
 */
async function get(user = null) {
	const res = await fetch(`${settings.base_url}/users/${user}`);
	if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
	return await res.json();
}

/**
 * Get info about logged in user
 * @param {...String} args If 1 argument is given then login with a token. If 2 arguments are given login with Username and Password
 * @returns {Promise<any>} Returns the logged in user
 */
async function client(...args) {
	const login_res = await login(args);
	const res = await fetch(`${settings.base_url}/user`, {
		headers: {
			Authorization: `Bearer ${login_res.token}`,
			"Content-Type": "application/json",
		},
	});
	return await res.json();
}

/**
 * Delete a user
 * @param {String} username The account's username
 * @param {String} password The account's password
 * @returns {Promise<any>} The deleted account, as it was before deletion
 */
async function remove(username, password) {
	hash = await sha256(password);
	const login_req = await login(username, password);
	const token = login_req.token;
	const res = await fetch(`${settings.base_url}/user`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ hash }),
	});
	if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
	return await res.json();
}

if (require.main === module) {
	(async (username, password) => {
		console.log(await register(username, password));
		console.log(await login(username, password));
		console.log(await client(username, password));
		console.log(await get(username));
		console.log(await remove(username, password));
	})("luca", "hunter2");
}

module.exports = {
	register,
	login,
	remove,
};
