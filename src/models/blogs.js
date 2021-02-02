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
		unique: true,
	},
	name: {
		type: String,
		required: true,
		default: function () {
			return this.short_name;
		},
	},
	description: {
		type: String,
		required: true,
		default: "No description provided",
	},
	data: {
		type: String,
		required: true,
		default: "No blog provided",
		minlength: 5,
		maxLength: 1000,
	},
	author: {
		type: String,
		required: true,
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
