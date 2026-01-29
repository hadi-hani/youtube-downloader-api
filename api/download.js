import ytdl from 'ytdl-core';

export default async function (req, res) {
  const url = req.query?.url;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Valid YouTube URL required in ?url=' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    return res.json({
      title: info.videoDetails.title,
      author: info.videoDetails.author?.name,
      duration: info.videoDetails.lengthSeconds,
      formats: formats.slice(0, 8).map(f => ({
        itag: f.itag,
        quality: f.qualityLabel || f.audioQuality,
        container: f.container,
        url: f.url
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
