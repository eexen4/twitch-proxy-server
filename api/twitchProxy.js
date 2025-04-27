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

    let allData = [];
    let pagination = '';
    let pageCounter = 0;
    const maxPages = 12; // Możesz zwiększyć jeśli chcesz (5 x 50 = 250 klipów max)

    do {
      const apiUrl = `https://api.twitch.tv/helix/${endpoint}?${params}${pagination ? `&after=${pagination}` : ''}`;

      const twitchResponse = await fetch(apiUrl, {
        headers: {
          "Client-ID": clientId,
          "Authorization": `Bearer ${accessToken}`,
        }
      });

      const data = await twitchResponse.json();

      if (data.data) {
        allData = allData.concat(data.data);
      }

      pagination = data.pagination?.cursor || '';
      pageCounter++;

    } while (pagination && pageCounter < maxPages);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).json({ data: allData });

  } catch (error) {
    console.error("Error contacting Twitch API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
