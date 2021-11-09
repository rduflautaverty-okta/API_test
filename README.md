![alt text](https://is3-ssl.mzstatic.com/image/thumb/Purple115/v4/c3/87/9e/c3879ebe-7b27-c1af-021e-e234a326c4e5/AppIcon-1x_U007emarketing-0-6-0-85-220.png/1200x630wa.png "Okta Logo")
# Cors Test Api
## General Purpose
This is a test application for the Okta API token and cors supported endpoints.
## Installation
You can run the npm.sh bash script located in the /install folder. This will install [Homebrew](https://brew.sh/), [NodeJS](https://nodejs.org/en/) and every npm dependency:

Dependencies | 
--- |
|npm install --save @okta/jwt-verifier|
|npm install --save express|
|npm install --save get-base-url|
|npm install --save request|
|npm install --save path|

## Startup
Double click on startup.sh or run the script from the Terminal.
## Connection
Fill the relevant info on the form, oen the browser's console, then press connect.
You will see several api calls, these endpoints are not cors enables, so nodeJS will add the "Access-Control-Allow-Origin" headers to complete the execution.
The app will create a new user and a test group, if the user or the gruop already exists, it will be re-created. This can be verified from the Org's admin dashboard.
## Cors endpoints
Once connected, the app will display the list of cors enabled APIs, exept the users: List users api which does not support cors (this one can be used to display the common cors error message in the console). Some of the endpoints require you to be logged into your org in your browser, as they rely on a valid active session cookie.
## Common issues
- you should enable 3rd party cookies in your browser

https://developer.okta.com
