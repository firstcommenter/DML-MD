const fetch = require('node-fetch');
const yts = require('yt-search');

const playSessions = new Map();

module.exports = {
  name: 'play3',
  aliases: ['ply', 'p3', 'pl3'],
  description: 'Search song/video and download as audio, video, or document with buttons',
  run: async (context) => {
    const { client, m, text } = context;

    try {
      const query = text ? text.trim() : '';
      const chatId = m.chat;
      const senderId = m.sender || m.key.participant || m.key.remoteJid;

      const getSessionKey = () => `${chatId}:${senderId}`;

      const sendError = async (msg) => {
        await client.sendMessage(chatId, {
          react: { text: '❌', key: m.key }
        });
        return m.reply(msg);
      };

      const sendAudio = async (videoUrl, title, thumbnail, duration) => {
        const apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp3v2?apikey=gifted&url=${encodeURIComponent(videoUrl)}&quality=128`;

        const response = await fetch(apiUrl);
        const raw = await response.text();

        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid MP3 API response');
        }

        const result = data.result || data.results || data;
        const audioUrl =
          result.download_url ||
          result.downloadUrl ||
          result.url ||
          result.audio ||
          result.link;

        if (!audioUrl) throw new Error('Audio URL not found from API');

        const safeTitle = (result.title || title || 'Unknown Song')
          .replace(/[<>:"/\\|?*]/g, '_')
          .trim();

        await client.sendMessage(chatId, {
          react: { text: '✅', key: m.key }
        });

        await client.sendMessage(
          chatId,
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
      };

      const sendVideo = async (videoUrl, title, thumbnail, duration) => {
        const apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(videoUrl)}&quality=720p`;

        const response = await fetch(apiUrl);
        const raw = await response.text();

        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid MP4 API response');
        }

        const result = data.result || data.results || data;
        const mp4Url =
          result.download_url ||
          result.downloadUrl ||
          result.url ||
          result.video ||
          result.link;

        if (!mp4Url) throw new Error('Video URL not found from API');

        const safeTitle = (result.title || title || 'Unknown Video')
          .replace(/[<>:"/\\|?*]/g, '_')
          .trim();

        await client.sendMessage(chatId, {
          react: { text: '✅', key: m.key }
        });

        await client.sendMessage(
          chatId,
          {
            video: { url: mp4Url },
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`,
            caption: `╭━〔 🎬 NOW PLAYING 〕━⬣
┃ 📹 ${safeTitle}
┃ ${duration ? `⏱️ ${duration}\n┃ ` : ''}📺 Quality: 720p
┃ ▶️ Sent as playable video
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ Powered by Dml`,
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
      };

      const sendDocument = async (videoUrl, title, duration) => {
        const apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(videoUrl)}&quality=720p`;

        const response = await fetch(apiUrl);
        const raw = await response.text();

        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid MP4 API response');
        }

        const result = data.result || data.results || data;
        const mp4Url =
          result.download_url ||
          result.downloadUrl ||
          result.url ||
          result.video ||
          result.link;

        if (!mp4Url) throw new Error('Document video URL not found from API');

        const safeTitle = (result.title || title || 'Unknown Video')
          .replace(/[<>:"/\\|?*]/g, '_')
          .trim();

        await client.sendMessage(chatId, {
          react: { text: '✅', key: m.key }
        });

        await client.sendMessage(
          chatId,
          {
            document: { url: mp4Url },
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`,
            caption: `╭━〔 📁 DOWNLOAD FILE READY 〕━⬣
┃ 🎬 ${safeTitle}
┃ ${duration ? `⏱️ ${duration}\n┃ ` : ''}📺 Quality: 720p
┃ ⬇️ Sent as document file
╰━━━━━━━━━━━━━━━━━━⬣
> 🚀 Dml Tech`,
          },
          { quoted: m }
        );
      };

      // Handle button response
      if (
        query === 'audio' ||
        query === 'video' ||
        query === 'file' ||
        query === 'play2_audio' ||
        query === 'play2_video' ||
        query === 'play2_file'
      ) {
        const sessionKey = getSessionKey();
        const saved = playSessions.get(sessionKey);

        if (!saved) {
          return m.reply(`╭━〔 ⚠️ NO ACTIVE SEARCH 〕━⬣
┃ No recent song search found.
┃
┃ ➤ Example:
┃   .play2 komasava
╰━━━━━━━━━━━━━━━━━━⬣
> 🎧 DML-MD`);
        }

        await client.sendMessage(chatId, {
          react: { text: '⌛', key: m.key }
        });

        const { videoUrl, title, thumbnail, duration } = saved;

        if (query === 'audio' || query === 'play2_audio') {
          await sendAudio(videoUrl, title, thumbnail, duration);
          playSessions.delete(sessionKey);
          return;
        }

        if (query === 'video' || query === 'play2_video') {
          await sendVideo(videoUrl, title, thumbnail, duration);
          playSessions.delete(sessionKey);
          return;
        }

        if (query === 'file' || query === 'play2_file') {
          await sendDocument(videoUrl, title, duration);
          playSessions.delete(sessionKey);
          return;
        }
      }

      if (!query) {
        return m.reply(`╭━〔 🎵 DML MEDIA ENGINE 〕━⬣
┃ ⚠️ No input detected.
┃
┃ ➤ Send a song name or YouTube link
┃
┃ ✦ Example:
┃   .play2 komasava
┃   .play2 https://youtu.be/dQw4w9WgXcQ
╰━━━━━━━━━━━━━━━━━━⬣
> 🚀 Powered by Dml Tech`);
      }

      await client.sendMessage(chatId, {
        react: { text: '⌛', key: m.key }
      });

      const isYoutubeLink =
        /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)?)([a-zA-Z0-9_-]{11})/i.test(query);

      let videoUrl = query;
      let title = 'Unknown Song';
      let thumbnail = '';
      let duration = '';

      if (isYoutubeLink) {
        const videoIdMatch = query.match(/([a-zA-Z0-9_-]{11})/i);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (videoId) {
          const info = await yts({ videoId });
          if (info) {
            videoUrl = info.url || query;
            title = info.title || title;
            thumbnail = info.thumbnail || '';
            duration = info.timestamp || '';
          }
        }
      } else {
        const search = await yts(query);

        if (!search?.videos?.length) {
          return sendError(`╭━〔 🔎 NO RESULTS FOUND 〕━⬣
┃ No matching results for:
┃ ➤ "${query}"
┃
┃ Try:
┃   • Different keywords
┃   • Artist name + song title
╰━━━━━━━━━━━━━━━━━━⬣
> 🎵 DML Search Engine`);
        }

        const video = search.videos[0];
        videoUrl = video.url;
        title = video.title || title;
        thumbnail = video.thumbnail || '';
        duration = video.timestamp || '';
      }

      const sessionKey = getSessionKey();
      playSessions.set(sessionKey, {
        videoUrl,
        title,
        thumbnail,
        duration,
        createdAt: Date.now()
      });

      setTimeout(() => {
        const current = playSessions.get(sessionKey);
        if (current && current.videoUrl === videoUrl) {
          playSessions.delete(sessionKey);
        }
      }, 120000);

      await client.sendMessage(chatId, {
        react: { text: '✅', key: m.key }
      });

      await client.sendMessage(
        chatId,
        {
          image: { url: thumbnail || 'https://files.catbox.moe/9f6czl.jpg' },
          caption: `╭━〔 🎶 SEARCH RESULT 〕━⬣
┃ 🎧 ${title}
┃ ${duration ? `⏱️ ${duration}\n┃ ` : ''}🔗 Ready to download
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 📌 CHOOSE FORMAT 〕━⬣
┃ Select one option below
╰━━━━━━━━━━━━━━━━━━⬣

> ⚡ Powered by Dml`,
          footer: 'DML-MD Media System',
          buttons: [
            {
              buttonId: `${query.startsWith('.') ? '' : ''}play2 audio`,
              buttonText: { displayText: '🎧 Audio' },
              type: 1
            },
            {
              buttonId: `${query.startsWith('.') ? '' : ''}play2 video`,
              buttonText: { displayText: '🎬 Video' },
              type: 1
            },
            {
              buttonId: `${query.startsWith('.') ? '' : ''}play2 file`,
              buttonText: { displayText: '📁 File' },
              type: 1
            }
          ],
          headerType: 4
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('play2 error:', error);

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
