## What is this?

A blog website. The goals of this project are
[ ] Login system
[ ] Mongodb for saving
[ ] Look pretty

## Usage

### Development mode

To start the website you must first install all dependencies and config, then you can just start the server.
`data/config.json` is just

```json
{
	"port": 5000
}
```

After all that you can start the server

```sh
npm install
npm run build
npm start
```

### Self hosting (not recommended)

(First read [development mode](#development-mode), specifically about configuring databases and config files.)
If you wish to host your own instance it's best to optimise a couple of stuff.

1. Set up NGINX to serve static files. For example:

    ```nginx
    server {
    	# Listen to IPv4 and IPv6
    	listen 80;
    	listen [::]:80;

    	server_name _;
    	# Change the port to whatever you have in data/config.json
    	location /cdn/ {
    		# Change the cache control depending on how often static files change
    		add_header Cache-Control max-age=696969;
    		root /path/to/dist/public;
    	}

    	location / {
    		proxy_pass http://localhost:PORT;
    	}
    }
    ```

2. `npm run start` for self hosting and not developer mode

## Developers

### Formatting

After saving your code please run `npm run format` to format the code as per the configuration in `package.json` in `prettier`
