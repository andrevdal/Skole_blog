const { Model } = require("mongoose");
/**
 * Model.findOne but easier to find with IDs.
 * @param {Model} Schema
 * @param {string} name The field to search for if the value isn't an ID
 * @param {string?} value Number like value or a string.
 * @param {any?} obj Other parameters
 * @param {{filter: string, populate: string}?} Options filter and populate options
 */
async function find(
	Schema,
	name,
	value = null,
	obj = {},
	{ filter, populate } = { filter: "", populate: "" }
) {
	if (isNaN(value)) obj[name] = value;
	else obj["_id"] = value;
	let output;
	if (populate) {
		output = await Schema.findOne(obj, filter).populate(populate)
		populate = populate.split(" ");
			for (let i = 0; i < populate.length; i++) {
				output[populate[i]] = JSON.parse(
					JSON.stringify(output[populate[i]])
				);
			}
	} else output = await Schema.findOne(obj, filter);
	return output;
}

/**
 * Model.findOne but easier to find with IDs.
 * @param {Model} Schema
 * @param {string} name The field to search for if the value isn't an ID
 * @param {string?} value Number like value or a string.
 * @param {any?} obj Other parameters
 * @param {{filter: string, populate: string}?} Options filter and populate options
 */
async function findAll(
	Schema,
	name = null,
	value = null,
	obj = {},
	{ filter, populate } = { filter: "", populate: "" }
) {
	if (isNaN(value)) obj[name] = value;
	else if (value) obj["_id"] = value;
	let output;
	if (populate) {
		// This whole mess is because mongoose won't json.stringify populated items properly
		// I would never encourage this but mongoose has forced my hand
		// And no developer would answer my cries of despair on either IRC or Gitter

		// TODO: When this website gets big FUCKING OPTIMISE THIS
		// Also optimise the function above, `find`.
		output = await Schema.find(obj, filter).populate(populate)
		populate = populate.split(" ");
		for (let i = 0; i < output.length; i++) {
			for (let ii = 0; ii < populate.length; ii++) {
				output[i][populate[ii]] = JSON.parse(
					JSON.stringify(output[i][populate[ii]])
				);
			}
		}
	} else output = await Schema.find(obj, filter);
	return output;
}

module.exports = {
	find,
	findAll,
};
