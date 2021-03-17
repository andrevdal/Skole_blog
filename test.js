const { User } = require("./src/models/users");
const mongoose = require("mongoose");
// Config mongoose
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/blog", { useNewUrlParser: true });

(async () => {
	const users = await User.find();
	for (i in users) {
		await User.findByIdAndUpdate(users[i]._id, {
			avatar: `https://identicon-api.herokuapp.com/${users[i]._id}/300?format=png`,
		});
	}
})();
