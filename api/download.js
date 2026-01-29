export default async function (req, res) {
  const url = req.query?.url;
  if (!url) {
    return res.status(400).json({ error: 'Use ?url=https://youtube.com/watch?v=ID' });
  }

  try {
    const ytdl = await import('@ybd-project/ytdl-core');
    const info = await ytdl.getBasicInfo(url);
    
    // فلتر يدوي لفيديو+صوت أو أفضل جودة
    const formats = info.formats.filter(f => 
      (f.hasVideo && f.hasAudio) || 
      (f.hasVideo && f.qualityLabel) ||
      f.audioQuality
    ).slice(0, 10);

    return res.json({
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds + 's',
      formats: formats.map(f => ({
        quality: f.qualityLabel || f.audioQuality || 'unknown',
        url: f.url,
        type: (f.hasVideo ? 'video' : 'audio') + '/' + (f.container || 'mp4'),
        itag: f.itag
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
