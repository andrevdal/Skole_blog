const { User } = require("./users");
const mongoose = require("mongoose");
const FlakeId = require("flakeid");
//initiate flake
const flake = new FlakeId({
	mid: 42, // Define machine id
	timeOffset: Date.UTC(2021, 0, 1), // Define epoch
});

const blogSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: () => flake.gen().toString(),
		alias: "id",
		inmutable: true,
	},
	short_name: {
		type: String,
		required: true,
		maxlength: 21,
		match: /^(?!-)[A-z0-9-]+(?<!-)((?!-)[A-z0-9-]+(?<!-))*((?!-\.)[A-z0-9-\.]+(?<!-\.))?$/,
	},
	name: {
		type: String,
		required: true,
		maxlength: 50,
		default: function () {
			return this.short_name;
		},
	},
	description: {
		type: String,
		required: true,
		maxlength: 100,
		default: "No description provided",
	},
	data: {
		type: String,
		required: true,
		default: "No blog provided",
		minlength: 5,
		maxlength: 1000,
	},
	author: {
		type: String,
		required: true,
		ref: "user",
	},
});
blogSchema.method("toJSON", function () {
	const blog = this.toObject();
	blog.id = blog._id;
	delete blog._id;
	delete blog.__v;
	return blog;
});
const Blog = mongoose.model("blog", blogSchema);
module.exports = {
	Blog,
};
