import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

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
      return res.status(200).json(JSON.parse(cached));
    }

    const apiKey = process.env.Mediastack_API_Key;
    if (!apiKey) {
      throw new Error("Missing Mediastack_API_Key env variable");
    }

    const api = `http://api.mediastack.com/v1/news?access_key=${apiKey}&countries=za`;

    const response = await fetch(api);
    const data = await response.json();

    await redis.set("mediastack:top", JSON.stringify(data), { ex: 900 });

    return res.status(200).json(data);

  } catch (error) {
    console.error("API Fetch Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch news from API" });
  }
}
