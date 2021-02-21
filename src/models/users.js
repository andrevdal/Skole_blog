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
		match: /^[^|:!"#.,<>]*$/,
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
	},
	external: {
		twitter: {
			url: String,
			show: {
				type: Boolean,
				default: true,
			},
		},
		youtube: {
			url: String,
			show: {
				type: Boolean,
				default: true,
			},
		},
		twitch: {
			url: String,
			show: {
				type: Boolean,
				default: true,
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
	return user;
});
const User = mongoose.model("user", userSchema);

module.exports = {
	User,
};
