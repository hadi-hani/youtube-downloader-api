export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method POST only' });
  }

  let body;
  try {
    body = JSON.parse(req.body || '{}');
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
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
      formats: formats.slice(0, 5).map(f => ({
        quality: f.qualityLabel || f.audioQuality,
        url: f.url,
        type: `${f.container}${f.qualityLabel ? ' ' + f.qualityLabel : ''}`
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
