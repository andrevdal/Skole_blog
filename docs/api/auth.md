# User

## Login
To login as a user you most make a GET request to `/login` with the `Authorization` header set to the `username:hashedPassword` encoded in base64. Take this example

```js
username = "Luca"
password = "hunter2"

authorization = `Basic ${btoa(`${username}:${await sha256(password)}`)}`
// Basic THVjYTpmNTJmYmQzMmIyYjNiODZmZjg4ZWY2YzQ5MDYyODI4NWY0ODJhZjE1ZGRjYjI5NTQxZjk0YmNmNTI2YTNmNmM3
```
Then 

```http
GET /login
Authorization: Basic THVjYTpmNTJmYmQzMmIyYjNiODZmZjg4ZWY2YzQ5MDYyODI4NWY0ODJhZjE1ZGRjYjI5NTQxZjk0YmNmNTI2YTNmNmM3
```

This should return an object with a `message` key which is used on the frontend usually, and a `token` which should be used for all requests from now on. 
It might include an `err` key if anything has happened. Those might get messy

## Register
Registering is almost the same, it's just the end point that changes from `/login` to `/register`.
