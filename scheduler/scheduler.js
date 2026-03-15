import Anthropic from "@anthropic-ai/sdk";
import { TwitterApi } from "twitter-api-v2";
import cron from "node-cron";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Twitter list ID from https://x.com/i/lists/2025504841041105055
const TWITTER_LIST_ID = "2025504841041105055";
const SUMMARIES_DIR = path.join(__dirname, "summaries");

// Ensure summaries directory exists
if (!fs.existsSync(SUMMARIES_DIR)) {
  fs.mkdirSync(SUMMARIES_DIR, { recursive: true });
}

function getTwitterClient() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error("TWITTER_BEARER_TOKEN is not set in environment variables");
  }
  return new TwitterApi(bearerToken);
}

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }
  return new Anthropic({ apiKey });
}

async function fetchListTweets(client) {
  console.log(`[${new Date().toISOString()}] Fetching tweets from list ${TWITTER_LIST_ID}...`);

  // Calculate start_time for the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const tweets = [];
  let nextToken;

  do {
    const response = await client.v2.listTweets(TWITTER_LIST_ID, {
      max_results: 100,
      start_time: since.toISOString(),
      "tweet.fields": ["created_at", "author_id", "text", "public_metrics"],
      "user.fields": ["name", "username"],
      expansions: ["author_id"],
      ...(nextToken ? { pagination_token: nextToken } : {}),
    });

    const data = response.data;
    const users = response.includes?.users ?? [];

    // Build a lookup for user info
    const userMap = {};
    for (const user of users) {
      userMap[user.id] = user;
    }

    if (data?.data) {
      for (const tweet of data.data) {
        const author = userMap[tweet.author_id];
        tweets.push({
          id: tweet.id,
          text: tweet.text,
          createdAt: tweet.created_at,
          authorName: author?.name ?? "Unknown",
          authorUsername: author?.username ?? "unknown",
          likes: tweet.public_metrics?.like_count ?? 0,
          retweets: tweet.public_metrics?.retweet_count ?? 0,
          replies: tweet.public_metrics?.reply_count ?? 0,
        });
      }
    }

    nextToken = data?.meta?.next_token;
  } while (nextToken);

  console.log(`[${new Date().toISOString()}] Fetched ${tweets.length} tweets.`);
  return tweets;
}

function formatTweetsForPrompt(tweets) {
  if (tweets.length === 0) {
    return "No tweets were posted in the last 24 hours.";
  }

  return tweets
    .map(
      (t, i) =>
        `[${i + 1}] @${t.authorUsername} (${t.authorName}) — ${t.createdAt}\n` +
        `${t.text}\n` +
        `Likes: ${t.likes} | Retweets: ${t.retweets} | Replies: ${t.replies}`
    )
    .join("\n\n---\n\n");
}

async function summarizeTweets(tweets) {
  const client = getAnthropicClient();
  const tweetContent = formatTweetsForPrompt(tweets);
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  console.log(`[${new Date().toISOString()}] Summarizing ${tweets.length} tweets with Claude...`);

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: `You are an expert analyst who reads and summarizes social media content.
Your task is to produce a clear, insightful daily digest from a curated Twitter/X list.
Focus on the most important themes, trending topics, notable insights, and key discussions.
Be concise but comprehensive. Use markdown formatting with headers and bullet points.`,
    messages: [
      {
        role: "user",
        content: `Please summarize the following tweets from the curated Twitter/X list for ${date}.

The tweets below cover the last 24 hours:

${tweetContent}

Produce a structured daily digest with:
1. **Top Themes** — 3–5 major topics discussed
2. **Key Insights** — The most important or thought-provoking points
3. **Notable Tweets** — 2–3 standout tweets worth highlighting (quote the relevant part)
4. **Trending Discussions** — Any debates or conversations gaining traction
5. **Quick Stats** — Total tweets, most engaged post (likes + retweets), most active author`,
      },
    ],
  });

  let summary = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
      summary += event.delta.text;
    }
  }

  console.log("\n");
  return summary;
}

function saveSummary(summary, tweets) {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const filename = path.join(SUMMARIES_DIR, `${dateStr}.md`);

  const content = `# Daily Twitter/X List Digest — ${dateStr}

> List: https://x.com/i/lists/${TWITTER_LIST_ID}
> Generated: ${now.toISOString()}
> Tweets analyzed: ${tweets.length}

---

${summary}
`;

  fs.writeFileSync(filename, content, "utf8");
  console.log(`[${now.toISOString()}] Summary saved to ${filename}`);
  return filename;
}

async function runDailySummary() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Daily Twitter/X List Summary — ${new Date().toISOString()}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    const twitterClient = getTwitterClient();
    const tweets = await fetchListTweets(twitterClient);

    if (tweets.length === 0) {
      console.log("No tweets found in the last 24 hours. Skipping summary.");
      return;
    }

    const summary = await summarizeTweets(tweets);
    const savedPath = saveSummary(summary, tweets);

    console.log(`\nDone! Summary saved to: ${savedPath}`);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error (${error.status}):`, error.message);
    } else {
      console.error("Error running daily summary:", error.message);
    }
    process.exitCode = 1;
  }
}

// Check for --once flag to run immediately without scheduling
const runOnce = process.argv.includes("--once");

if (runOnce) {
  runDailySummary();
} else {
  // Schedule to run every day at 8:00 AM (server local time)
  console.log("Daily Twitter/X List Summarizer started.");
  console.log("Scheduled to run every day at 8:00 AM.");
  console.log(`List ID: ${TWITTER_LIST_ID}`);
  console.log('Run with --once flag to execute immediately.\n');

  cron.schedule("0 8 * * *", () => {
    runDailySummary();
  });

  // Also run immediately on startup to verify configuration
  console.log("Running initial summary to verify setup...\n");
  runDailySummary();
}
