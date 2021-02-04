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

if (require.main === module) {
	(async (user, blog) => {
		console.log(await get(user, blog));
	})("luca", "virus");
}
