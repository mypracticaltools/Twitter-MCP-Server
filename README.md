# 𝕏 (Twitter) MCP Server

[![npm version](https://img.shields.io/npm/v/@practicaltools/twitter-mcp-server.svg)](https://www.npmjs.com/package/@practicaltools/twitter-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Powered by [practicaltools/cheap-simple-twitter-api](https://apify.com/practicaltools/cheap-simple-twitter-api) via Apify.

A Model Context Protocol (MCP) server that provides comprehensive access to Twitter (𝕏) data, including advanced search, user profiles, tweets, followers, followings, mentions, and more.

## ✨ Features

- **Advanced Search**: Powerful search with filters (`from:NASA`, `min_faves:100`, etc.)
- **User Intelligence**: Profiles, followers, following, and latest tweets.
- **Engagement Insights**: Mentions, retweeters, quotes, and replies.
- **List Support**: Fetch tweets from specific Twitter lists.
- **Pagination Support**: Seamlessly fetch large datasets using cursors.
- **Cleaned Data**: Optimized for LLM consumption with noise removal and truncation.

## 🛠️ Tools

The server provides 11 specialized tools:

1. `twitter_search`: Advanced search with `type: Latest | Top`.
2. `twitter_user_info`: Profile details for any handle.
3. `twitter_user_tweets`: Latest tweets from a user.
4. `twitter_mentions`: Recent mentions of a user.
5. `twitter_followers`: User's follower list.
6. `twitter_followings`: Accounts a user is following.
7. `twitter_tweet_replies`: Threaded conversation replies.
8. `twitter_tweet_quotes`: Quotes of a specific tweet.
9. `twitter_tweet_retweeters`: List of users who retweeted.
10. `twitter_tweets_by_ids`: Lookup specific tweets.
11. `twitter_list_tweets`: Tweets from a Twitter list.

## Use With OpenClaw And TweetClaw

This MCP server is a focused Twitter/X data reader. Keep it responsible for
search, profile, tweet, follower, reply, quote, retweeter, and list lookups.

If an OpenClaw agent also needs approval-gated account workflows, install
[TweetClaw](https://github.com/Xquik-dev/tweetclaw) beside this MCP server:

```bash
openclaw plugins install npm:@xquik/tweetclaw
```

Use TweetClaw for post tweets, post tweet replies, media upload, media
download, direct messages, monitor tweets, webhooks, giveaway draws, and source
packets before handing reviewed tweet IDs, handles, or search terms back to
this server.

Keep authentication values in MCP client or OpenClaw config. Do not paste them
into prompts, docs, logs, screenshots, or issue comments.

## 🚀 Quick Start

### Prerequisites
- An [Apify API Token](https://console.apify.com/account/integrations) (Required)

### Configuration

#### Claude Desktop
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "twitter": {
      "command": "npx",
      "args": ["-y", "@practicaltools/twitter-mcp-server"],
      "env": {
        "APIFY_API_TOKEN": "YOUR_APIFY_TOKEN"
      }
    }
  }
}
```

#### GitHub Copilot (via `config.yaml`)
```yaml
mcpServers:
  twitter:
    command: npx
    args: ["-y", "@practicaltools/twitter-mcp-server"]
    env:
      APIFY_API_TOKEN: YOUR_APIFY_TOKEN
```

## 📖 Authentication

This server requires an Apify API token. The underlying actor used is highly cost-effective (~$0.10 per 1,000 results).

1. Get your token from the [Apify Console](https://console.apify.com/account/integrations).
2. Set it as the `APIFY_API_TOKEN` environment variable.

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
