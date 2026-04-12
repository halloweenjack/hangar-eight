export default async function handler(req, res) {
  // トークンリフレッシュは管理者のみ実行可能
  const adminKey = req.query.key;
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'INSTAGRAM_ACCESS_TOKEN not configured' });
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
    );
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // 新しいトークンを返す（Vercel環境変数は手動で更新が必要）
    return res.status(200).json({
      message: 'Token refreshed. Update INSTAGRAM_ACCESS_TOKEN in Vercel environment variables.',
      access_token: data.access_token,
      expires_in_days: Math.floor(data.expires_in / 86400)
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
}
