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
		match: /^(?!-)[A-z0-9-]+(?<!-)((?!-)[A-z0-9-]+(?<!-))*((?!-\.)[A-z0-9-\.]+(?<!-\.))?$/,
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
		maxlength: 50,
	},
	avatar: {
		type: String,
		default: function() {
			return `https://identicon-api.herokuapp.com/${this._id}/300?format=png`
		},
	},
	external: {
		twitter: {
			url: {
				type: String,
				maxlength: 15,
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
				maxlength: 25,
				minlength: 3,
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
	// Sending an avatar can be megabytes of data, so this would be a filter
	// But not sending anything is also a bad idea
	// TODO: Figure it out
	// if (user.avatar.length >= 200) delete user.avatar;
	for (let i in user.external)
		if (!user.external[i].show) delete user.external[i].url;
	return user;
});
const User = mongoose.model("user", userSchema);

module.exports = {
	User,
};
