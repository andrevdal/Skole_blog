# Blogs object
This taken straight from `src/models/blogs.js`. 

```js
id: {
	type: String,
	default: () => flake.gen().toString(),
	inmutable: true,
},
short_name: {
	type: String,
	required: true,
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
```

For example: 
```json
{
	"description": "Really scary",
	"data": "## Hello world! \n **I** __love__ *stuff*. <script>alert(1)</script>",
	"name": "Virus.exe",
	"short_name": "virus",
	"author": "12438958361452544",
	"id": "12486445617029120"
}
```

# REST API

## Blogs

### `GET /blogs/:user/:blog`

All parameters are optional. 
`blog` and `user` can be either IDs or usernames and short_name. 

```http
GET /api/blogs/:user/:blog HTTP/2.0
```

If no user is provided then it will return all blogs. 
If no blog is provided then it will return all blogs that are written by that user.

### `POST /blogs`

**Requires [authentification](../auth)**

Only `name` is optional.
`data` can be markdown formatted, and it will be displayed as such. 

```http
POST /api/blogs HTTP/2.0
{
	"name": "Top 10 cats",
	"short_name": "cats",
	"description": "Ever wondered what are the top cats?",
	"data": "# Cats \n **Cats** are a human's worst nightmare",
}
```

Returns the newly created blog.

### `DELETE /blogs/:user/:blog`

**Requires [authentification](../auth)**

Deletes a user's blog. This endpoint is available to owners of the blog or a user with `admin: true`. 

```http
DELETE /api/:user/:blog HTTP/2.0
Content-Type: application/json
```
