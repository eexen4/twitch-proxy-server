// api/twitchProxy.js

export default async function handler(req, res) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const { endpoint, params } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: "Missing endpoint parameter" });
  }

  try {
    // Get OAuth Token
    const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
      method: 'POST'
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const apiUrl = `https://api.twitch.tv/helix/${endpoint}?${params}`;

    const twitchResponse = await fetch(apiUrl, {
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    const data = await twitchResponse.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);

  } catch (error) {
    console.error("Error contacting Twitch API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
