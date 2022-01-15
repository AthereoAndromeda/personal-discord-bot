# Personal-Discord-Bot V3

Personal Discord Bot rewritten in TypeScript.

<div align="center">

[![Node.js CI](https://github.com/AthereoAndromeda/CalNatSci-TS/actions/workflows/node.js.yml/badge.svg)](https://github.com/AthereoAndromeda/Personal-Discord-Bot-TS/actions/workflows/node.js.yml)
[![Docker Image CI](https://github.com/AthereoAndromeda/CalNatSci-TS/actions/workflows/docker-image.yml/badge.svg)](https://github.com/AthereoAndromeda/Personal-Discord-Bot-TS/actions/workflows/docker-image.yml)

</div>

## Fresh New Start
This is a continuation of the `Personal-Discord-Bot-TS` git repo (now a Private Archive) on a new clean repo. The older repo had to be scrapped and restarted due to some errors.

**Personal-Discord-Bot-TS Stats:**
- First Commit: 25 February 2021
- No. of Commits: 625
- Last Commit: 1 November 2021
- Age when Archived: 8 months


## Description
This bot basically does whatever I want for my Discord servers. It has a somewhat large selection of commands, such as sniping, fetching data from APIs, and other stuff. This bot got a lot more complex and larger than I expected it to be, it originally had no database, then i upgraded to SQLite3, then to PostgreSQL. Big thanks to my friends who kept me motivated to work and gave ideas for my personal mini-project 😄

I was going to use the Google Classroom API to show new assignments and announcements right in Discord,
but i didn't go through with it since I have to host my own site to redirect users to authorize for Google, and store users in a database. Then i have to find a good way of interfacing with the GClass API through Discord. This is a little too much, so i decided to not do it and maybe do it in a later date

You can clone the repo if you want to, but you will have to create your own bot and self-host it. You will also need to host a Postgres database. 

## Building from source

**Prerequisites:**

- NodeJS 16.x or above
- PostgreSQL database
- Discord Token

Create `.env` file. See `example.env` for reference.

```env
DISCORD_TOKEN=your_token_here
DATABASE_URL=
...
```

After cloning the repo, install deps

```bash
# Development
npm ci

# Production
npm ci --only=production
```

Build App

```bash
# Build with tsc
npm run build

# Build with SWC (Builds much faster, but experimental)
npm run dev-build
```

Run App

```bash
# Run in production mode
npm start

# Run in development mode
npm run dev

# Watch and recompile for changes
npm run ts-dev
```
