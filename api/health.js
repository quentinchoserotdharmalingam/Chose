import { MODEL } from "./_shared.js";

export default function handler(req, res) {
  res.json({ status: "ok", model: MODEL });
}
