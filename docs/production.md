# Production

Some recommendations for running in production environments.

## Installation

### Nginx and Git method (recommended)

```bash
> npm install -g cs
> git clone {{yourapp}} /your/app/dir
> cd /your/app/dir
> npm install
```

> If you aren't using GIT, just copy your files to your server manually then `npm install`

Add your Nginx Rule (Assumes your production port is 3000)

``` 
server {
	listen 80;
	server_name {{yourDomain.com}}
	location / {
		proxy_pass	http://127.0.0.1:3000/;
	}
}
```

Install forever

``` bash
npm install -g forever
```

Restart Nginx

```bash
> /etc/init.d/nginx restart
```

## How to run

``` bash
forever start -c "node --harmony" index.js production
```

## How to restart

``` bash
forever restart index.js
```

