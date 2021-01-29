const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
	external: {
		twitter: {
			url: {
				type: String,
			},
			show: {
				type: Boolean,
			},
		},
		youtube: {
			url: {
				type: String,
			},
			show: {
				type: Boolean,
			},
		},
		twitch: {
			url: {
				type: String,
			},
			show: {
				type: Boolean,
			},
		},
	},
});
// This is the function that filters what the api returns
userSchema.method("toJSON", function() {
	const user = this.toObject();
	delete user.hash;
	delete user.__v;
	return user;
});
const User = mongoose.model("user", userSchema);

module.exports = {
	User,
};
