export default function handler(req, res) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) return res.status(500).json({ error: "MISTRAL_API_KEY not configured" });
  res.json({ key });
}
