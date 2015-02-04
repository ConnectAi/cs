# Production

Some recommendations for running in production environments.

## Installation

### Nginx and Git method (recommended)

> NOTE: This is just what we do---you can do whatever you want.

```bash
> npm install -g cs
> git clone {{yourapp}} /your/app/dir
> cd /your/app/dir
> npm install
```

Add your Nginx Rule (Assumes your production port is 3000)

```
server {
	listen 80;
	server_name {{yourDomain.com}}
	access_log  /var/log/nginx/node.log;
	location / {
		proxy_pass	http://127.0.0.1:3000/;
	}
}
```

Create a service in /etc/init/node.conf

```
description "node server"

start on started mountall
stop on shutdown

respawn
respawn limit 99 5

script
	export HOME="{{APP DIR}}}"
	cd $HOME
	exec /usr/bin/node {{APP DIR}}}/index.js production >> /var/log/node.log 2>&1
end script

post-start script
end script
```


Restart Nginx

```bash
> /etc/init.d/nginx restart
```


### Manual method

```bash
# get your files onto the live server and SSH in
> npm install -g cs
> cd {{app dir}}
> npm install
```

> You should probably still install the init script above


## How to run

> NOTE: This is just how we run it---you can do whatever you want.

```bash
> start {{whatever you called the file in /etc/init/}}
```

> NOTE: If you're in your CS dir already, you can just run `cs run`

> NOTE: If you're running CS behind nginx, you don't need the word `production`
