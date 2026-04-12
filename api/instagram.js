export default async function handler(req, res) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'INSTAGRAM_ACCESS_TOKEN not configured' });
  }

  const limit = Math.min(parseInt(req.query.limit) || 12, 25);
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}&limit=${limit}`
    );
    const data = await response.json();

    if (data.error) {
      console.error('Instagram API error:', data.error);
      return res.status(400).json({ error: data.error.message });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data.data || []);
  } catch (error) {
    console.error('Instagram fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch Instagram data' });
  }
}
