# User

## Login

To authentificate you must submit a header that is a base64 encoded string of the username and sha256 hashed password. Such as

Username: Luca

Password: hunter2

String to encode: `luca:f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7`

> **Warning!** Because of this the username may **NOT** include a colon (:).

```http
GET /api/login HTTP/2.0
Authorization: Basic bHVjYTpmNTJmYmQzMmIyYjNiODZmZjg4ZWY2YzQ5MDYyODI4NWY0ODJhZjE1ZGRjYjI5NTQxZjk0YmNmNTI2YTNmNmM3
```

Returns a JSON object

```jsonc
{
	"message": "User Authentificated",
	"expiresIn": 3600, // In ms
	"token": "long long token" // JWT token
}
```

## Register

Same way to transfer the username and password,

```http
POST /api/login HTTP/2.0
Authorization: Basic bHVjYTpmNTJmYmQzMmIyYjNiODZmZjg4ZWY2YzQ5MDYyODI4NWY0ODJhZjE1ZGRjYjI5NTQxZjk0YmNmNTI2YTNmNmM3
```
