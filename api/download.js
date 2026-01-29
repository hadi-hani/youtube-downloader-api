export default async function (req, res) {
  const url = req.query?.url;
  if (!url) {
    return res.status(400).json({ error: 'Use ?url=https://youtube.com/watch?v=ID' });
  }

  try {
    // Serverless import لـ Vercel
    const { YtdlCore } = await import('@ybd-project/ytdl-core/serverless');
    const ytdl = new YtdlCore();

    const info = await ytdl.getFullInfo(url);
    
    // فلتر formats لفيديو+صوت
    const formats = info.formats.filter(f => f.url && (f.hasVideo || f.audioQuality));

    return res.json({
      title: info.basicInfo.title,
      author: info.basicInfo.author.name,
      duration: info.basicInfo.duration + 's',
      formats: formats.slice(0, 8).map(f => ({
        quality: f.qualityLabel || f.audioQuality || 'audio/video',
        url: f.url,
        type: f.hasVideo ? 'video/' + f.container : 'audio/' + f.container,
        itag: f.itag
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
