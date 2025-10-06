# DevsGoWhere Telegram

Discover events for software engineers in Singapore, on Telegram!

This program scrapes the [DevsGoWhere](https://devsgowhere.com/) website daily for new events and posts them on the Telegram [channel](t.me/devsgowhere).

## Development

A [Cloudflare](https://www.cloudflare.com/) account and [Telegram Bot](https://core.telegram.org/bots) is required.

### 1. Setting up the project environment

1. Install project dependencies
```
pnpm i
```

2. Create `wrangler.jsonc` and `.env`
```
cp wrangler.example.jsonc wrangler.jsonc && cp .env.example .env
```
### 2. Setting up CloudFlare

1. Create your [Workers KV](https://developers.cloudflare.com/kv/) instance using the Cloudflare Dashboard

2. Replace `<workers-kv-ID>` in `wrangler.jsonc` with your workers KV instance ID

3. Login to Cloudflare using `wrangler`
```
npx wrangler login
```
### 3. Setting up Telegram

1. Use [@BotFather](https://t.me/botfather) to create your Telegram Bot

2. Create a public Telegram channel, and add your bot to it

3. Add your bot token to `.env` 

4. Replace `<telegram-channel-name>` in `wrangler.jsonc` with your telegram channel name (e.g. If your invite link is `t.me/devsgowhere`, fill `devsgowhere` as your channel name)
### 4. Run the project locally

1. Run the project
```
pnpm run dev
```

2. Test the worker function (after project is running)
```
pnpm run scheduled
```

## Deployment
```
pnpm run deploy
```

This command:
- Updates the [Cloudflare Worker TypeScript types](https://developers.cloudflare.com/workers/languages/typescript/) for the project
- Deploys a [Cloudflare Worker](https://developers.cloudflare.com/workers/) instance on your account using the `prod` env variables defined in `wrangler.jsonc`