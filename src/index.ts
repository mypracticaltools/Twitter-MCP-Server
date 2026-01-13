#!/usr/bin/env node
// Force disable ANSI colors in dependencies
process.env.FORCE_COLOR = '0';
process.env.NO_COLOR = '1';

// Redirect all console.log to console.error to protect stdout for MCP protocol
const originalLog = console.log;
console.log = (...args) => {
    console.error(...args);
};

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ApifyClient } from "apify-client";
import * as dotenv from "dotenv";
import { z } from "zod";

// Suppress output to stdout to avoid breaking MCP protocol
dotenv.config({ quiet: true });

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || "";

// Initialize client with dummy token if missing (soft startup check)
// This allows tools like Smithery to scan the server without a token
const apifyClient = new ApifyClient({
    token: APIFY_API_TOKEN || "dummy-token",
});

const server = new Server(
    {
        name: "Twitter MCP",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Tool definitions mapping to practicaltools/cheap-simple-twitter-api
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "twitter_search",
                description: "Search for tweets using advanced operators. Returns cleaned tweet objects.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string", description: "Standard Twitter search query (e.g., 'from:NASA', 'keyword1 keyword2')" },
                        queryType: { type: "string", enum: ["Latest", "Top"], default: "Latest", description: "Search order" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["query"],
                },
            },
            {
                name: "twitter_user_info",
                description: "Get detailed profile information for a Twitter handle.",
                inputSchema: {
                    type: "object",
                    properties: {
                        userName: { type: "string", description: "Twitter handle (without @)" },
                    },
                    required: ["userName"],
                },
            },
            {
                name: "twitter_user_tweets",
                description: "Fetch the latest tweets for a specific user handle.",
                inputSchema: {
                    type: "object",
                    properties: {
                        userName: { type: "string", description: "Twitter handle" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["userName"],
                },
            },
            {
                name: "twitter_mentions",
                description: "Fetch recent tweets that mention a specific user handle.",
                inputSchema: {
                    type: "object",
                    properties: {
                        userName: { type: "string", description: "Twitter handle" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["userName"],
                },
            },
            {
                name: "twitter_followers",
                description: "Get the followers of a specific user handle.",
                inputSchema: {
                    type: "object",
                    properties: {
                        userName: { type: "string", description: "Twitter handle" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["userName"],
                },
            },
            {
                name: "twitter_followings",
                description: "Get the users followed by a specific user handle.",
                inputSchema: {
                    type: "object",
                    properties: {
                        userName: { type: "string", description: "Twitter handle" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["userName"],
                },
            },
            {
                name: "twitter_tweet_replies",
                description: "Fetch conversation replies for a specific tweet ID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tweet_id: { type: "string", description: "The ID of the tweet" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["tweet_id"],
                },
            },
            {
                name: "twitter_tweet_quotes",
                description: "Fetch quotes of a specific tweet ID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tweet_id: { type: "string", description: "The ID of the tweet" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["tweet_id"],
                },
            },
            {
                name: "twitter_tweet_retweeters",
                description: "Get users who retweeted a specific tweet ID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tweetId: { type: "string", description: "The ID of the tweet" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["tweetId"],
                },
            },
            {
                name: "twitter_tweets_by_ids",
                description: "Fetch specific tweets by their IDs.",
                inputSchema: {
                    type: "object",
                    properties: {
                        tweet_ids: { type: "string", description: "Comma-separated list of tweet IDs" },
                    },
                    required: ["tweet_ids"],
                },
            },
            {
                name: "twitter_list_tweets",
                description: "Fetch tweets from a specific Twitter list ID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        listId: { type: "string", description: "The ID of the Twitter list" },
                        cursor: { type: "string", description: "Pagination cursor" },
                    },
                    required: ["listId"],
                },
            }
        ],
    };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (!process.env.APIFY_API_TOKEN) {
            throw new Error("APIFY_API_TOKEN is not set. Please provide your Apify API Token in the environment variables.");
        }

        let endpoint = "";
        let parameters: any = {};

        switch (name) {
            case "twitter_search":
                endpoint = "tweet/advanced_search";
                parameters = { query: args?.query, queryType: args?.queryType || "Latest", cursor: args?.cursor };
                break;
            case "twitter_user_info":
                endpoint = "user/info";
                parameters = { userName: args?.userName };
                break;
            case "twitter_user_tweets":
                endpoint = "user/last_tweets";
                parameters = { userName: args?.userName, cursor: args?.cursor };
                break;
            case "twitter_mentions":
                endpoint = "user/mentions";
                parameters = { userName: args?.userName, cursor: args?.cursor };
                break;
            case "twitter_followers":
                endpoint = "user/followers";
                parameters = { userName: args?.userName, cursor: args?.cursor };
                break;
            case "twitter_followings":
                endpoint = "user/followings";
                parameters = { userName: args?.userName, cursor: args?.cursor };
                break;
            case "twitter_tweet_replies":
                endpoint = "tweet/replies";
                parameters = { tweet_id: args?.tweet_id, cursor: args?.cursor };
                break;
            case "twitter_tweet_quotes":
                endpoint = "tweet/quotes";
                parameters = { tweet_id: args?.tweet_id, cursor: args?.cursor };
                break;
            case "twitter_tweet_retweeters":
                endpoint = "tweet/retweeters";
                parameters = { tweetId: args?.tweetId, cursor: args?.cursor };
                break;
            case "twitter_tweets_by_ids":
                endpoint = "tweet/by_ids";
                parameters = { tweet_ids: args?.tweet_ids };
                break;
            case "twitter_list_tweets":
                endpoint = "list/tweets";
                parameters = { listId: args?.listId, cursor: args?.cursor };
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }

        console.error(`Running Twitter Actor: ${endpoint} with params ${JSON.stringify(parameters)}`);

        // Run the actor
        const run = await apifyClient.actor("practicaltools/cheap-simple-twitter-api").call({
            endpoint,
            parameters
        });

        // Fetch results
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            return {
                content: [{ type: "text", text: "No results found for this request." }],
            };
        }

        // Format results (truncating content for efficiency)
        const formattedResults = items.map((item: any) => {
            const result: any = { ...item };
            if (result.text && result.text.length > 300) {
                result.text = result.text.substring(0, 300) + "... (truncated)";
            }
            return result;
        });

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(formattedResults, null, 2),
                },
            ],
        };

    } catch (error: any) {
        console.error("Error in Twitter MCP:", error);
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Twitter MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
