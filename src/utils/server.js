const { Model } = require("mongoose");
/**
 * Model.findOne but easier to find with IDs.
 * @param {Model} Schema
 * @param {string} name The field to search for if the value isn't an ID
 * @param {string?} value Number like value or a string.
 * @param {any?} query Other parameters for the search
 * @param {{filter: string, populate: string}?} Options filter and populate options
 */
async function find(
	Schema,
	name,
	value = null,
	query = {},
	{ filter = "", populate = "" } = { filter: "", populate: "" }
) {
	if (isNaN(value)) query[name] = value;
	else query["_id"] = value;
	let output;
	if (populate) {
		output = await Schema.findOne(query, filter).populate(populate);
		populate = populate.split(" ");
		for (let i = 0; i < populate.length; i++) {
			output[populate[i]] = JSON.parse(
				JSON.stringify(output[populate[i]])
			);
		}
	} else output = await Schema.findOne(query, filter);
	return output;
}

/**
 * Model.findOne but easier to find with IDs.
 * @param {Model} Schema
 * @param {string} name The field to search for if the value isn't an ID
 * @param {string?} value Number like value or a string.
 * @param {any?} query Other parameters for the search
 * @param {{filter: string, populate: string}?} Options filter and populate options
 */
async function findAll(
	Schema,
	name = null,
	value = null,
	query = {},
	{
		filter = "",
		populate = "",
		offset = 0,
		max = undefined,
		sort = "_id",
		direction = 1,
	} = {
		filter: "",
		populate: "",
		offset: 0,
		max: undefined,
		sort: "_id",
		direction: 1,
	}
) {
	if (isNaN(value)) query[name] = value;
	else if (value) query["_id"] = value;
	const options = {
		limit: max,
		skip: offset,
		sort: {},
	};
	options.sort[sort] = direction;
	let output;
	if (populate) {
		// This whole mess is because mongoose won't json.stringify populated items properly
		// I would never encourage this but mongoose has forced my hand
		// And no developer would answer my cries of despair on either IRC or Gitter

		// TODO: When this website gets big FUCKING OPTIMISE THIS
		// Also optimise the function above, `find`.
		output = await Schema.find(query, filter, options).populate(populate);
		populate = populate.split(" ");
		for (let i = 0; i < output.length; i++) {
			for (let ii = 0; ii < populate.length; ii++) {
				output[i][populate[ii]] = JSON.parse(
					JSON.stringify(output[i][populate[ii]])
				);
			}
		}
	} else output = await Schema.find(query, filter, options);
	return output;
}

module.exports = {
	find,
	findAll,
};
