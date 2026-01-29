export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const rawBody = req.body ? (Buffer.isBuffer(req.body) ? req.body.toString() : req.body) : '{}';
  
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON', body: rawBody });
  }

  const { url } = body;
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const { YtdlCore } = await import('@ybd-project/ytdl-core');
    const ytdl = new YtdlCore();
    const info = await ytdl.getBasicInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    return res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0]?.url,
      duration: info.videoDetails.lengthSeconds,
      formats: formats.slice(0, 10).map(f => ({
        itag: f.itag,
        quality: f.qualityLabel || f.audioQuality,
        url: f.url,
        type: f.hasVideo ? 'video' : 'audio',
        container: f.container
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
