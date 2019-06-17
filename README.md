# Trello Clone AppSync Backend

## Emulator

```
npm run emulator
```

This command will start a **@conduitvc/appsync-emulator-serverless** server.
The trick is when is tested on graphql playground, you have to set the headers to:

```json
{
  "x-api-key": "1"
}
```

I observed the value is not interesting.
