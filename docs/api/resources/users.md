# User object

This taken straight from `src/models/users.js` minus some elements that are not returned by the REST API such as the hash.

```js
id: {
	type: String,
	default: () => flake.gen().toString(),
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
```

For example:

```json
{
	"external": {
		"twitter": {
			"show": true
		},
		"youtube": {
			"show": true
		},
		"twitch": {
			"show": true
		}
	},
	"admin": false,
	"username": "luca",
	"created_at": "2021-02-04T07:47:58.780Z",
	"id": "12438958361452544"
}
```

# REST API

## User

### `GET /user`

**Requires [authentification](../auth)**

```http
GET /api/user HTTP/2.0
```

Returns the logged in user.

### `DELETE /user`

**Requires [authentification](../auth)**

Must also provide a `hash` which is the user's password sha256 hashed.
An optional `keep` boolean may be provided if a user wishes for their blogs to be transfered to a user called `archive`.

```http
DELETE /api/user HTTP/2.0
Content-Type: application/json

{
	"hash": "f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7",
	"keep": true
}
```

## Users

### `GET /users`

```http
GET /api/users/ HTTP/2.0
```

Returns an array of all users.

### `GET /users/:user`

User can be either a username or it can be an ID. So `/users/luca` and `/users/12436686671880192` can return the same thing (given the ID is correct)

```http
GET /api/users/:user HTTP/2.0
```

Returns the user.
