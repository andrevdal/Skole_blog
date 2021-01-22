import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	hash: {
		type: String,
		required: true,
	},
	salt: {
		type: String,
		required: true,
	},
});

export const User = mongoose.model("user", userSchema);
