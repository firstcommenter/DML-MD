const fetch = require('node-fetch');
const yts = require('yt-search');

const playSessions = new Map();

module.exports = {
  name: 'play3',
  aliases: ['ply', 'p3', 'pl3'],
  description: 'Search song/video and send only selected format using Gifted API buttons',
  run: async (context) => {
    const { client, m, text } = context;

    try {
      const query = text ? text.trim() : '';
      const chatId = m.chat;
      const senderId = m.sender || m.key.participant || m.key.remoteJid;
      const sessionKey = `${chatId}:${senderId}`;

      const sendReact = async (emoji) => {
        await client.sendMessage(chatId, {
          react: { text: emoji, key: m.key }
        });
      };

      const parseJson = async (response, label) => {
        const raw = await response.text();
        try {
          return JSON.parse(raw);
        } catch {
          throw new Error(`Invalid ${label} API response`);
        }
      };

      const normalizeMediaUrl = (result) =>
        result?.download_url ||
        result?.downloadUrl ||
        result?.url ||
        result?.audio ||
        result?.video ||
        result?.link;

      const safeName = (name) =>
        (name || 'Unknown Media')
          .replace(/[<>:"/\\|?*]/g, '_')
          .trim();

      const getYoutubeInfo = async (input) => {
        const isYoutubeLink =
          /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)?)([a-zA-Z0-9_-]{11})/i.test(input);

        let videoUrl = input;
        let title = 'Unknown Song';
        let thumbnail = '';
        let duration = '';

        if (isYoutubeLink) {
          const idMatch = input.match(/([a-zA-Z0-9_-]{11})/i);
          const videoId = idMatch ? idMatch[1] : null;

          if (videoId) {
            const info = await yts({ videoId });
            if (info) {
              videoUrl = info.url || input;
              title = info.title || title;
              thumbnail = info.thumbnail || '';
              duration = info.timestamp || '';
            }
          }
        } else {
          const search = await yts(input);

          if (!search?.videos?.length) {
            return null;
          }

          const video = search.videos[0];
          videoUrl = video.url;
          title = video.title || title;
          thumbnail = video.thumbnail || '';
          duration = video.timestamp || '';
        }

        return { videoUrl, title, thumbnail, duration };
      };

      const sendAudioOnly = async ({ videoUrl, title, thumbnail, duration }) => {
        const apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp3v2?apikey=gifted&url=${encodeURIComponent(videoUrl)}&quality=128`;
        const response = await fetch(apiUrl);
        const data = await parseJson(response, 'MP3');
        const result = data.result || data.results || data;
        const audioUrl = normalizeMediaUrl(result);

        if (!audioUrl) throw new Error('Audio URL not found from API');

        const finalTitle = safeName(result.title || result.name || title);

        await sendReact('✅');

        await client.sendMessage(
          chatId,
          {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${finalTitle}.mp3`,
            ptt: false,
            contextInfo: thumbnail
              ? {
                  externalAdReply: {
                    title: finalTitle.substring(0, 40),
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

      const sendVideoOnly = async ({ videoUrl, title, thumbnail, duration }) => {
        const apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(videoUrl)}&quality=720p`;
        const response = await fetch(apiUrl);
        const data = await parseJson(response, 'MP4');
        const result = data.result || data.results || data;
        const videoFileUrl = normalizeMediaUrl(result);

        if (!videoFileUrl) throw new Error('Video URL not found from API');

        const finalTitle = safeName(result.title || result.name || title);

        await sendReact('✅');

        await client.sendMessage(
          chatId,
          {
            video: { url: videoFileUrl },
            mimetype: 'video/mp4',
            fileName: `${finalTitle}.mp4`,
            caption: `╭━〔 🎬 NOW PLAYING 〕━⬣
┃ 📹 ${finalTitle}
┃ ${duration ? `⏱️ ${duration}\n┃ ` : ''}📺 Quality: 720p
┃ ▶️ Sent as playable video
╰━━━━━━━━━━━━━━━━━━⬣
> ⚡ Powered by Dml`,
            contextInfo: thumbnail
              ? {
                  externalAdReply: {
                    title: finalTitle.substring(0, 40),
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

      const sendDocumentOnly = async ({ videoUrl, title, duration }) => {
        const apiUrl = `https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(videoUrl)}&quality=720p`;
        const response = await fetch(apiUrl);
        const data = await parseJson(response, 'MP4');
        const result = data.result || data.results || data;
        const documentUrl = normalizeMediaUrl(result);

        if (!documentUrl) throw new Error('Document URL not found from API');

        const finalTitle = safeName(result.title || result.name || title);

        await sendReact('✅');

        await client.sendMessage(
          chatId,
          {
            document: { url: documentUrl },
            mimetype: 'video/mp4',
            fileName: `${finalTitle}.mp4`,
            caption: `╭━〔 📁 DOWNLOAD FILE READY 〕━⬣
┃ 🎬 ${finalTitle}
┃ ${duration ? `⏱️ ${duration}\n┃ ` : ''}📺 Quality: 720p
┃ ⬇️ Sent as document file
╰━━━━━━━━━━━━━━━━━━⬣
> 🚀 Dml Tech`,
          },
          { quoted: m }
        );
      };

      // Button/command actions
      if (
        query === 'audio' ||
        query === 'video' ||
        query === 'file' ||
        query === 'play2 audio' ||
        query === 'play2 video' ||
        query === 'play2 file' ||
        query === 'play2_audio' ||
        query === 'play2_video' ||
        query === 'play2_file'
      ) {
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

        await sendReact('⌛');

        if (query === 'audio' || query === 'play2 audio' || query === 'play2_audio') {
          await sendAudioOnly(saved);
          playSessions.delete(sessionKey);
          return;
        }

        if (query === 'video' || query === 'play2 video' || query === 'play2_video') {
          await sendVideoOnly(saved);
          playSessions.delete(sessionKey);
          return;
        }

        if (query === 'file' || query === 'play2 file' || query === 'play2_file') {
          await sendDocumentOnly(saved);
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

      await sendReact('⌛');

      const info = await getYoutubeInfo(query);

      if (!info) {
        await sendReact('❌');
        return m.reply(`╭━〔 🔎 NO RESULTS FOUND 〕━⬣
┃ No matching results for:
┃ ➤ "${query}"
┃
┃ Try:
┃   • Different keywords
┃   • Artist name + song title
╰━━━━━━━━━━━━━━━━━━⬣
> 🎵 DML Search Engine`);
      }

      playSessions.set(sessionKey, {
        videoUrl: info.videoUrl,
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        createdAt: Date.now()
      });

      setTimeout(() => {
        const current = playSessions.get(sessionKey);
        if (current && current.videoUrl === info.videoUrl) {
          playSessions.delete(sessionKey);
        }
      }, 120000);

      await sendReact('✅');

      await client.sendMessage(
        chatId,
        {
          image: { url: info.thumbnail || 'https://files.catbox.moe/9f6czl.jpg' },
          caption: `╭━〔 🎶 SEARCH RESULT 〕━⬣
┃ 🎧 ${info.title}
┃ ${info.duration ? `⏱️ ${info.duration}\n┃ ` : ''}🔗 Ready to download
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 📌 CHOOSE FORMAT 〕━⬣
┃ Select one option below
╰━━━━━━━━━━━━━━━━━━⬣

> ⚡ Powered by Dml`,
          footer: 'DML-MD Media System',
          buttons: [
            {
              buttonId: 'play2 audio',
              buttonText: { displayText: '🎧 Audio' },
              type: 1
            },
            {
              buttonId: 'play2 video',
              buttonText: { displayText: '🎬 Video' },
              type: 1
            },
            {
              buttonId: 'play2 file',
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
