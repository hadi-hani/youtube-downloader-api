import { YtdlCore } from '@ybd-project/ytdl-core';

export default async function (req, res) {
  if (req.method !== 'POST') return res.status(405).send('POST only');
  try {
    const { url } = await req.json();
    if (!url) return res.status(400).send('URL required');
    
    const ytdl = new YtdlCore();
    const info = await ytdl.getBasicInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    
    res.json({
      title: info.videoDetails.title,
      formats: formats.slice(0, 5).map(f => ({
        quality: f.qualityLabel || f.audioQuality,
        url: f.url,
        type: f.container
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
