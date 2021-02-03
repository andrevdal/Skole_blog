## What is this?

A blog website. The goals of this project are

-   [x] Login system
-   [x] Mongodb for saving
-   [ ] Look pretty

## Usage

### Development mode

To start the website you must first install all dependencies and config, then you can just start the server.
`confs/config.json` is just

```jsonc
{
	"port": 5000, // Port available for http (https during testing)
	"secret": "Super Duper secret here" // Used for JWT tokens and cookie secret
}
```

This website deals with secure context APIs, such as crypto, therfor we need to use https in development as well.
To generate the certificate keys use this command

```sh
openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out ./confs/server.cert -keyout ./confs/server.key
```

After all that you can start the server

```sh
npm install
npm test
```

### Self hosting (not recommended)

(First read [development mode](#development-mode), specifically about configuring databases and config files.)
If you wish to host your own instance it's best to optimise a couple of stuff.

1. Set up NGINX to serve static files. For example (using certbot):

    ```nginx
    server {

    	server_name www.blog.com;

    	location / {
    		proxy_pass http://localhost:5000;
    	}

    	location ~ \.(gif|jpg|png|css|js|html|svg)$ {
    		root "/path/to/blog/src/public";
    	}

    	listen [::]:443 ssl; # managed by Certbot
    	listen 443 ssl; # managed by Certbot
    	ssl_certificate /etc/letsencrypt/live/www.blog.com/fullchain.pem; # managed by Certbot
    	ssl_certificate_key /etc/letsencrypt/live/www.blog.com/privkey.pem; # managed by Certbot
    	include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    	ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    }
    server {
    	if ($host = www.blog.com) {
    		return 301 https://$host$request_uri;
    	} # managed by Certbot

    	server_name www.blog.com;

    	listen 80;
    	listen [::]:80;
    	return 404; # managed by Certbot
    }
```

2. `npm start` for self hosting and not developer mode

## Developers

### Formatting

After saving your code please run `npm run format` to format the code as per the configuration in `package.json` in `prettier`
```
