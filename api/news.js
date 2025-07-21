import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default handler = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const cached = await redis.get("mediastack:top");
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  try {
    const apiKey = process.env.Mediastack_API_Key;
    const api = `https://api.mediastack.com/v1/news?access_key=${apiKey}&countries=za`;

    const response = await fetch(api);
    const data = await response.json();

    await redis.set("mediastack:top", JSON.stringify(data), { ex: 900 });

    return res.status(200).json(JSON.parse(cached));

  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch news from API" });
  }
};
