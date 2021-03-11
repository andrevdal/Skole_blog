const mongoose = require("mongoose");
const FlakeId = require("flakeid");

//initiate flake
const flake = new FlakeId({
	mid: 42, // Define machine id
	timeOffset: Date.UTC(2021, 0, 1), // Define epoch
});

const userSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: () => flake.gen().toString(),
		alias: "id",
		inmutable: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		maxlength: 21,
		match: /^(?!-)[a-z0-9-]+(?<!-)(\/(?!-)[a-z0-9-]+(?<!-))*(\/(?!-\.)[a-z0-9-\.]+(?<!-\.))?$/,
	},
	hash: {
		type: String,
		required: true,
	},
	created_at: {
		type: Date,
		default: Date.now,
		immutable: true,
	},
	admin: {
		type: Boolean,
		default: false,
	},
	bio: {
		type: String,
		default: "No bio provided",
		maxLength: 50,
	},
	external: {
		twitter: {
			url: {
				type: String,
				maxLength: 15,
				match: /^@?(\w){1,15}$/,
				set: (url) =>
					`https://twitter.com/${
						url.split("?")[0].split("/").splice(-1)[0]
					}`,
			},
			show: {
				type: Boolean,
				default: false,
			},
		},
		youtube: {
			url: {
				type: String,
			},
			show: {
				type: Boolean,
				default: false,
			},
		},
		twitch: {
			url: {
				type: String,
				maxLength: 25,
				minLength: 3,
				// Names such as ESL or Orb were given as prizes, you can't make accounts with then anymore but might aswell support them.
				match: /^(#)?[a-zA-Z0-9][\w]$/,
				set: (url) =>
					`https://twitch.tv/${
						url.split("?")[0].split("/").splice(-1)[0]
					}`,
			},
			show: {
				type: Boolean,
				default: false,
			},
		},
	},
});
// This is the function that filters what the api returns
userSchema.method("toJSON", function () {
	const user = this.toObject();
	delete user.hash;
	user.id = user._id;
	delete user._id;
	delete user.__v;
	delete user.avatar;
	for (let i in user.external)
		if (!user.external[i].show) delete user.external[i].url;
	return user;
});
const User = mongoose.model("user", userSchema);

module.exports = {
	User,
};
