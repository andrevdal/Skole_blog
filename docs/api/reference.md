## IDs

IDs are 64bit numbers calculated from the assbook epoch (2021.1.1). For example `12436686671880192`.

## REST API

Returns a JSONP response unless specified otherwise. To get a callback append `?callbaack=foo` or whatever name you want your call back function to be. [To learn more about jsonp read on wikipedia](https://en.wikipedia.org/wiki/JSONP).

> **Warning**, take this output as an unordered object. The order of those keys may change at any time!

### `GET /api/`

To get a general overview over the available endpoints of the api you can make a GET request to `/` and it will return a dynamically generated array such as:

```json
[
	{
		"method": "DELETE",
		"path": "/user",
		"restricted": true
	},
	{
		"method": "GET",
		"path": "/blogs/:user?/:id?",
		"restricted": false
	}
]
```

-   The method represents the HTTP verb to be used.
-   The path represents the url relative to the base url of the api (`https://www.example.com/api/user`).
-   The restricted key shows if the route needs [authentification](./auth.md) to be used.

### POSTing

For nested keys you may submit objects such as:

```json
{
	"external.twitter.show": true
}
```

is the same as

```json
{
	"external": {
		"twitter": {
			"show": true
		}
	}
}
```

### Embedding

To embed a resource you must provide the http parameter `embed=` with a comma separeted list. For example:

```http
GET /api/blogs HTTP/2.0
```

```json
[
	{
		"description": "The purpose of this user revealed",
		"name": "What is this user?",
		"short_name": "readme",
		"author": "19165880630026240",
		"id": "19165880650997760"
	}
]
```

```http
GET /api/blogs?embed=author,data HTTP/2.0
```

```json
[
	{
		"description": "The purpose of this user revealed",
		"data": "# Who are you?\nThis user is created automatically by the server. It's purpose is to archive blogs from users that want to delete their account but don't want to delete their blogs. \nAs a side note it's also used for testing. \n",
		"name": "What is this user?",
		"short_name": "readme",
		"author": {
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
			"bio": "A user to save deleted blogs. This account is automated and not a real human. ",
			"username": "archive",
			"created_at": "2021-02-22T21:18:22.029Z",
			"_id": "19165880630026240"
		},
		"id": "19165880650997760"
	}
]
```

### Sorting

For resources that return arrays, such as `/users` or `/blogs` you may pass the `orderby` and `direction` arguments.

-   `orderby` can be any key in the requested object and it will be sorted by it. Defaults to `id`
-   `direction` can be either `asc` or `desc` wether the items should be sorted **asc**ending or **desc**ending. Defaults to `asc`.

### Pagination

For resources that return arrays, such as `/users` or `/blogs` you may pass the `max` and `offset` arguments.

-   `max` determines how many objects may be returned
-   `offset` determines wether to ignores the first `x` objects.´

### POSTing

While we do support form encoded HTTP bodies, JSON is the prefered choice.

### Rate limitation

By default all api routes are rate limited to 1000 requests allowed every 10 minutes. When an IP address is rate limited it will return a JSON object with a status of `429`:

```json
{
	"message": "You are making too many requests, please try again later. "
}
```

Other routes may have different rate limitations and they should be specified in the documentation.
