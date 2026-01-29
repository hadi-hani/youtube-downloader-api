export default async function (req, res) {
  const url = req.query?.url || req.body;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ 
      error: 'URL required. Use ?url=https://youtube.com/watch?v=ID or POST body' 
    });
  }

  try {
    const { YtdlCore } = await import('@ybd-project/ytdl-core');
    const ytdl = new YtdlCore();
    const info = await ytdl.getBasicInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    return res.json({
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds + 's',
      formats: formats.slice(0, 10).map(f => ({
        quality: f.qualityLabel || f.audioQuality,
        url: f.url,
        type: f.container + (f.qualityLabel ? ' ' + f.qualityLabel : ''),
        size: Math.round(f.contentLength / 1e6) + 'MB' || '?'
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
