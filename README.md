## Running the connector on Heroku

Click the button below to deploy the connector to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=noborder)](https://heroku.com/deploy?template=https://github.com/pomegran/vonage-voice-teneo)

In the 'Config Vars' section, add the following (required):
* **TENEO_ENGINE_URL:** The engine url
* **WEBHOOK_FOR_VONAGE:** Endpoint for deployed application e.g. https://heroku-vonage-voice-teneo.herokuapp.com/
These are not required but can also be set:
* **LANGUAGE_ASR:** Language to ASR, defaults to en-GB if not specified
* **VOICENAME:** Voice for TTS.  Defaults to 'Amy', go to https://developer.nexmo.com/voice/voice-api/guides/text-to-speech
* **PORT:** Port to run the application on (defaults to 1337 if not specified)
* **PATH_TO_ANSWER:** Defaults to '/webhooks/answer'

## Setting up Vonage

1. Create an application: https://dashboard.nexmo.com/applications.  Ensure you enable "Voice" for your option then set "voice event url" to the endpoint for this application and the "Answer URL" to <endpoint for this application>+<PATH_TO_ANSWER>.  N.B. PATH_TO_ANSWER defaults to "/webhooks/answer". 
2. Add a number: https://dashboard.nexmo.com/your-numbers.  Link the application created in step 1 to this number