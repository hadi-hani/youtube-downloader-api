const ytdl = require('ytdl-core');

module.exports = async function (req, res) {
  // نسمح فقط بـ GET
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ error: 'Only GET method is allowed. Use ?url=' });
  }

  const url = req.query?.url;

  // التحقق من صحة رابط يوتيوب
  if (!url || !ytdl.validateURL(url)) {
    return res
      .status(400)
      .json({ error: 'Valid YouTube URL required in ?url=' });
  }

  try {
    const info = await ytdl.getInfo(url);

    const allFormats = ytdl.filterFormats(info.formats, 'videoandaudio');

    const formats = allFormats.slice(0, 8).map((f) => ({
      itag: f.itag,
      quality: f.qualityLabel || f.audioQuality,
      container: f.container,
      url: f.url
    }));

    return res.status(200).json({
      title: info.videoDetails.title,
      author: info.videoDetails.author?.name,
      duration: info.videoDetails.lengthSeconds,
      formats
    });
  } catch (err) {
    console.error('Download endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
};
