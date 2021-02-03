async function find(Schema, name, value, obj = {}) {
	let foo;
	if (isNaN(value)) {
		obj[name] = value;
		foo = await Schema.findOne(obj);
	} else {
		obj["_id"] = value;
		foo = await Schema.findOne(obj);
	}
	return foo;
}

module.exports = {
	find,
};
