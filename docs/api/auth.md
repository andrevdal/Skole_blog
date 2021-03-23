## Login

### Rate limitation

#### `/login`

The rate limitation is reduced to 20 requests every 10 minutes.

#### `/register`

The rate limitation is reduced to 10 requests every 10 minutes.

### Basic

To authentificate you must submit a header that is a base64 encoded string of the username and sha256 hashed password. Such as

Username: Luca  
Password: hunter2

String to encode: `luca:f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7`

> **Warning!** Because of this the username may **NOT** include a colon (:).

```http
GET /api/login HTTP/2.0
Authorization: Basic bHVjYTpmNTJmYmQzMmIyYjNiODZmZjg4ZWY2YzQ5MDYyODI4NWY0ODJhZjE1ZGRjYjI5NTQxZjk0YmNmNTI2YTNmNmM3
```

### Bearer

To authentificate using a JWT token you must first aquire one from the `/login` endpoint. Then you can use it the same way you would use a Basic authentification, but you use the `Bearer` prefix instead of `Basic`.

```http
GET /api/login HTTP/2.0
Authentification: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImV4dGVybmFsIjp7InR3aXR0ZXIiOnsic2hvdyI6dHJ1ZX0sInlvdXR1YmUiOnsic2hvdyI6dHJ1ZX0sInR3aXRjaCI6eyJzaG93Ijp0cnVlfX0sImFkbWluIjpmYWxzZSwidXNlcm5hbWUiOiJsdWNhIiwiY3JlYXRlZF9hdCI6IjIwMjEtMDItMDFUMDk6NTc6MzcuOTMwWiIsImlkIjoiMTEzODQ0MjI4ODg4MDg0NDgifSwiaWF0IjoxNjEyMjYyODg1LCJleHAiOjE2MTIyNjY0ODV9.28ACL_ptmYG1oo_eZpinHRGQS3MgtPHQn0T7e7L-gNU
```
