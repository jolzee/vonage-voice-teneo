# TIE API Client for Javascript

This module provides a way of communicating with a Teneo Engine instance either on the server as a NodeJS module or in a browser loaded through a script node.

## Usage

### Node.js

**Example usage**

``` javascript
const TIE = require('@artificialsolutions/tie-api-client');

const teneoEngineUrl = 'https://some.teneo/engine-instance';
const logResponse = (response) => {
  console.log(response.output);
  return response;
}

TIE.sendInput(teneoEngineUrl, null, { text: 'Hello there' })
  .then(logResponse)
  .then(({ sessionId }) => TIE.sendInput(teneoEngineUrl, sessionId, { text: 'How are you doing?' }))
  .then(logResponse)
  .then(({ sessionId }) => TIE.close(teneoEngineUrl, sessionId));
```

Note that when used as a Node.js module, you need to manually handle the session by passing the session ID to the API functions.

### Browser

When using the API in the browser, you need to first have a bundled version of the API that you can load on the page. You can generate a bundled version of the API by executing the `npm run build` script (see section on [local development](#setting_up_the_project_for_local_development)). The bundled file will be placed in the *dist/* directory.

**Example usage**

``` javascript
const teneoEngineUrl = 'https://some.teneo/engine-instance';
const logResponse = (response) => {
  console.log(response.output);
  return response;
}

TIE.sendInput(teneoEngineUrl, null, { text: 'Hello there' })
  .then(logResponse)
  .then(() => TIE.sendInput(teneoEngineUrl, null, { text: 'How are you doing?' }))
  .then(logResponse)
  .then(() => TIE.close(teneoEngineUrl));
```

Note that in the browser the session is maintained via cookies and the API cannot manually override the browser's handling of the session. That means that you never need (nor should) pass the session ID when using the API in the browser.

**A note on CORS**

TIE API Client needs to send a cookie to the Teneo Engine instance in order for the session to be maintained. This requires CORS communication to be setup between the place where the TIE API Client is and the Teneo Engine instance. The TIE API Client handles this by sending the value of `document.location.origin` to the Teneo Engine instance as a parameter.

By default the Teneo Engine includes CORS headers in the responses to browser requests coming from any domain. This means any site can interact with a Teneo Engine. If you want to restrict your engine to only include CORS headers for specific domains, you can add a file called `tieapi_cors_origins.txt` to your solution. You can upload this file in Teneo Studio in the Teneo Resource Manager where you should add it to the `views` folder. The file should contain the list of allowed origin domains (one domain per line, domains should include port numbers if applicable).

## API Documentation

### TIE.sendInput

Sends *inputData* to the *url*. Returns a *Promise* if no *callback* is provided.

##### Signature

```javascript
TIE.sendInput(url: string, sessionId: string, inputData: object, [callback: function])
```

##### Parameters

**url**: URL to a running Teneo Engine instance.

**sessionId**: Session id to be passed to the Teneo Engine instance. Pass *null* if unknown.

**inputData**: An object taking the shape:

```javascript
{
  text: "Some input text",
  someParam: "foo",
  anotherParam: "bar"
}
```

All properties except *text* will be sent to the Teneo Engine instance as extra parameters.

**callback(error: Error, response: teneoEngineResponse)** [Optional]: Callback for handling the response from the Teneo Engine instance.

### TIE.close

Closes the running (or specified session). Returns a *Promise* if no *callback* is provided.

##### Signture

```javascript
TIE.close(url: string, sessionId: string, [callback: function])
```

##### Parameters

**url**: URL to a running Teneo Engine instance.

**sessionId**: Session id to be passed to the Teneo Engine instance. Pass *null* if unknown.

**callback(error: Error, response: TeneoEngineResponse)** [Optional]: Callback for handling the response from the Teneo Engine instance.

### TIE.init

Returns a version of the Teneo Interaction Engine API with the Teneo Engine url prefilled.

```javascript
> const teneoApi = TIE.init('https://some.teneo/engine-instance');
> teneoApi.sendInput(null, { text: 'Sending some text to the prefilled url' })
    .then(response =>
      console.log(response);
      return teneoApi.close(response.sessionId);
    });
```

##### Signature

```javascript
TIE.init(url: string)
```

##### Parameters

**url**: URL to a running Teneo Engine instance.

### TeneoEngineResponse

Response from the Teneo Interaction Engine API.

Normal response:

``` json
{
  "status": 0,
  "input": {
	  "text": "input text",
	  "parameters": {}
	 },
   "output": {
	   "text": "output text",
	   "emotion":"",
	   "link":"",
	   "parameters": {}
	 },
   "sessionId": "current session id"
}
```

Error response:

``` json
{
  "status": -1,
  "input": {
    "text": "input text",
    "parameters": {}
  },
  "message": "ERROR MESSAGE"
}
```

## Setting up the project for local development

  1. Ensure you have supported versions of Node and NPM installed (see the `engines` property in [package.json](package.json "package.json"))
  2. Run `npm install`
  3. Run `npm test`

[tie-api-server]: ../../tie-api-server
