const fetch = require("node-fetch");
const settings = require("./settings.json");
const user = require("./users");

/**
 * @param {String | Number} user The user's to be fetched
 * @param {String | Number} blog The blog to be fetched
 * @returns {Promise<any>} Returns the blog.
 * If no user provided then it will return all blogs.
 * If no blog is provided it will return that user's blogs.
 */
async function get(user = null, blog = null) {
	if (!user && blog) throw Error("No user provided");
	const res = await fetch(`${settings.base_url}/blogs/${user}/${blog}`);
	if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
	return await res.json();
}

/**
 * @param {String} username
 * @param {String} password
 * @param {Object} data The blog to be uploaded
 * @returns {Promise<any>} Returns the blog.
 * If no user provided then it will return all blogs.
 * If no blog is provided it will return that user's blogs.
 */
async function post(username, password, data) {
	const login_res = await user.login(username, password);
	const res = await fetch(`${settings.base_url}/blogs`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${login_res.token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
	return await res.json();
}

/**
 * @param {String} username
 * @param {String} password
 * @param {Object} data The fields of a blog to be updated
 * @returns {Promise<any>} Returns the blog.
 * If no user provided then it will return all blogs.
 * If no blog is provided it will return that user's blogs.
 */
async function patch(username, password, data) {
	const login_res = await user.login(username, password);
	const res = await fetch(
		`${settings.base_url}/blogs/${username}/${data.short_name}`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${login_res.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: data.name + "aaa",
				short_name: data.short_name,
				description: data.description + "aaa",
				data: data.data + "aaa",
			}),
		}
	);
	if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
	return await res.json();
}

/**
 * @param {String} username
 * @param {String} password
 * @param {String} blog The blog's short_name or ID to be deleted.
 * @returns {Promise<any>} Returns the blog.
 * If no user provided then it will return all blogs.
 * If no blog is provided it will return that user's blogs.
 */
async function remove(username, password, blog) {
	const login_res = await user.login(username, password);
	const res = await fetch(`${settings.base_url}/blogs/${username}/${blog}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${login_res.token}`,
			"Content-Type": "application/json",
		},
	});
	if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 4));
	return res.status;
}

if (require.main === module) {
	(async (username, password, data) => {
		console.log(await post(username, password, data));
		console.log(await patch(username, password, data));
		console.log(await get(username, data.short_name));
		console.log(await remove(username, password, data.short_name));
	})("luca", "hunter2", {
		name: "Testy test",
		short_name: "test",
		description: "Just a test",
		data: "I am a *test*. Ignore me! <p onLoad='alert(1)'/>",
	});
}
