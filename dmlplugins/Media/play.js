const fetch = require('node-fetch');
const yts = require('yt-search');

module.exports = {
  name: 'play',
  aliases: ['ply', 'p', 'ppl'],
  description: 'Searches a song on YouTube and downloads it as MP3',
  run: async (context) => {
    const { client, m, text } = context;

    try {
      const query = text ? text.trim() : '';

      if (!query) {
        return m.reply(`╭━〔 🎵 DML MUSIC ENGINE 〕━⬣
┃ ⚠️ No input detected.
┃
┃ ➤ Send a song name or YouTube link.
┃
┃ ✦ Example:
┃   .play2 komasava
┃   .play2 https://youtu.be/dQw4w9WgXcQ
╰━━━━━━━━━━━━━━━━━━⬣
> 🚀 Powered by Dml Tech`);
      }

      await client.sendMessage(m.chat, {
        react: { text: '⌛', key: m.key }
      });

      const isYoutubeLink =
        /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)?)([a-zA-Z0-9_-]{11})/i.test(query);

      let videoUrl = query;
      let title = 'Unknown YouTube Song';
      let thumbnail = '';
      let duration = '';

      if (!isYoutubeLink) {
        const search = await yts(query);

        if (!search?.videos?.length) {
          await client.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
          });

          return m.reply(`╭━〔 🔎 NO RESULTS FOUND 〕━⬣
┃ No matching results for:
┃ ➤ "${query}"
┃
┃ Try:
┃   • Different keywords
┃   • Artist name + song title
╰━━━━━━━━━━━━━━━━━━⬣
> 🎵 DmlSearch Engine`);
        }

        const video = search.videos[0];
        videoUrl = video.url;
        title = video.title || title;
        thumbnail = video.thumbnail || '';
        duration = video.timestamp || '';
      } else {
        const search = await yts({ videoId: query.match(/([a-zA-Z0-9_-]{11})/i)?.[1] });

        if (search) {
          title = search.title || title;
          thumbnail = search.thumbnail || '';
          duration = search.timestamp || '';
          videoUrl = search.url || query;
        }
      }

      const apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp3v2?apikey=gifted&url=${encodeURIComponent(videoUrl)}&quality=128`;

      const response = await fetch(apiUrl);
      const textData = await response.text();

      let data;
      try {
        data = JSON.parse(textData);
      } catch {
        throw new Error('Invalid response from the API');
      }

      const result = data.result || data.results || data;

      const audioUrl =
        result.download_url ||
        result.downloadUrl ||
        result.url ||
        result.audio ||
        result.link;

      title =
        result.title ||
        result.name ||
        title ||
        'Unknown YouTube Song';

      thumbnail =
        result.thumbnail ||
        result.image ||
        thumbnail ||
        '';

      if (!audioUrl) {
        await client.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        });

        return m.reply(`╭━〔 ❌ DOWNLOAD FAILED 〕━⬣
┃ Unable to process your request.
┃
┃ ➤ Possible Reasons:
┃   • Song not found
┃   • Video unavailable
┃   • API returned no audio URL
┃
┃ Please try again.
╰━━━━━━━━━━━━━━━━━━⬣
> 🎵 DmlDownloader`);
      }

      const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').trim();

      await client.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      });

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          ptt: false,
          contextInfo: thumbnail
            ? {
                externalAdReply: {
                  title: safeTitle.substring(0, 40),
                  body: duration ? `Duration: ${duration}` : 'DML-MD',
                  thumbnailUrl: thumbnail,
                  sourceUrl: videoUrl,
                  mediaType: 1,
                  renderLargerThumbnail: true,
                },
              }
            : undefined,
        },
        { quoted: m }
      );

      await client.sendMessage(
        m.chat,
        {
          document: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          caption: `╭━〔 🎶 NOW PLAYING 〕━⬣
┃ 🎧 ${safeTitle}
┃ ${duration ? `⏱️ ${duration}\n┃ ` : ''}⬇️ Download completed successfully
┃ 📀 Format: MP3
┃ 🎚️ Quality: 128kbps
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ Powered by Dml`,
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('Play2 error:', error);

      await client.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });

      await m.reply(`╭━〔 🚨 PLAY ERROR 〕━⬣
┃ Something went wrong while processing.
┃
┃ Error:
┃ ${error.message}
┃
┃ Please try again later.
╰━━━━━━━━━━━━━━━━━━⬣
> 🛠️ DML-MD System`);
    }
  }
};
