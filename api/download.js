import ytdl from 'ytdl-core';

export default async function (req, res) {
  const url = req.query.url;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Valid YouTube URL required in ?url=' });
  }

  try {
    const info = await ytdl.getInfo(url);
    
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    return res.json({
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds + 's',
      formats: formats.slice(0, 8).map(f => ({
        quality: f.qualityLabel || f.audioQuality,
        url: f.url,
        type: f.container,
        itag: f.itag
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
