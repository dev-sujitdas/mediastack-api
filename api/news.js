// pages/api/news.js (or /api/news/index.js)
import { Redis } from "@upstash/redis";
import fetch from "node-fetch"; // required outside Next.js

const redis = Redis.fromEnv(); // or directly using Redis({...})

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const cached = await redis.get("mediastack:top");

    if (cached) {
      return res.status(200).json({ data: JSON.parse(cached) });
    }

    const apiKey = d8f89db2a329fc7f8de47b8b6bec02e6;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const api = `http://api.mediastack.com/v1/news?access_key=${apiKey}&countries=za`;
    const response = await fetch(api);
    const result = await response.json();

    await redis.set("mediastack:top", JSON.stringify(result.data), { ex: 900 });

    return res.status(200).json({ data: result.data });

    return res.status(200).json({ data: result.data });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message || "Unknown server error" });
  }
}
