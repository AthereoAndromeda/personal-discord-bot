# Personal-Discord-Bot-TS V3

Personal Discord Bot rewritten in TypeScript.

<div align="center">

[![Node.js CI](https://github.com/AthereoAndromeda/CalNatSci-TS/actions/workflows/node.js.yml/badge.svg)](https://github.com/AthereoAndromeda/Personal-Discord-Bot-TS/actions/workflows/node.js.yml)
[![Docker Image CI](https://github.com/AthereoAndromeda/CalNatSci-TS/actions/workflows/docker-image.yml/badge.svg)](https://github.com/AthereoAndromeda/Personal-Discord-Bot-TS/actions/workflows/docker-image.yml)

</div>

## Fresh New Start
This is a continuation of the `Personal-Discord-Bot-TS` git repo (now a Private Archive) on a new clean repo. The older repo had to be scrapped and restarted due to some errors.

**Personal-Discord-Bot-TS Stats:**
- First Commit: 25 February 2020
- No. of Commits: 625
- Last Commit: 1 November 2021
- Age when Archived: 8 months


## Description
I was going to use the Google Classroom API to show new assignments and announcements right in Discord,
but i didn't go through with it since I have to host my own site to redirect users to authorize for Google, and store users in a database. Then i have to find a good way of interfacing with the GClass API through Discord. This is a little too much, so i decided to not do it and maybe do it in a later date

**I'm not making the bot public.** You can clone the repo if you want to, but you will have to create your own bot since this is sort of used for my own server. This means you have to supply your own PostgreSQL database as well.

The bot does stuff for my server. It handles warnings, polls, role-reacts and stuff like that.
This bot became a lot larger and complex than I expected it to. It handles some database stuff
with PostgreSQL (and soon Redis), and now can run in Docker Containers. The bot now has a web server as well so I can update it over the internet.

## Building from source

**Prerequisites:**

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
