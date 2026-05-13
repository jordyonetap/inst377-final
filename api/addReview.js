//api call 1: fetch reviews from supabase

export default async function handler(req, res) {
  const response = await fetch(
    "https://fwifqkstdrmiocaghqzs.supabase.co/rest/v1/Music Reviews",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`
      },
      body: JSON.stringify(req.body)
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}