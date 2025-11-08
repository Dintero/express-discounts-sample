### Introduction

This is an example of how to respond to discounts for different scenarios.

### Usage

* Start the local server
* Create a tunnel to the local server
* Create a session

### Starting the server

```
npm run serve
```

### Create a tunnel to the local server

You can use [ngrok](https://ngrok.com/) to create a tunnel to the local server.

```
ngrok http 3000
```

### Create a session

Create an api client, see https://docs.dintero.com/docs/checkout/checkout-client.

Run this command and insert the client id, secret and audience from the api client.

```
npm run dintero-login
```

Run this command to create a session. Open the resulting url in a browser.

```
npm run create-session --callback_public_hostname <ngrok_url>
```
