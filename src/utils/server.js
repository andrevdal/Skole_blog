async function find(Schema, name, value = null, obj = {}) {
	let foo;
	if (isNaN(value)) obj[name] = value;
	else obj["_id"] = value;

	return await Schema.findOne(obj);
}

module.exports = {
	find,
};
