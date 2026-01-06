const yts = require("yt-search");
const axios = require("axios");

module.exports = async (context) => {
    const { client, m, text } = context;

    // Input validation
    if (!text) return m.reply("Are you mute? Give me a song name. It's not rocket science.");
    if (text.length > 100) return m.reply("Your 'song title' is longer than your attention span. Keep it under 100 characters.");

    try {
        // Show loading reaction
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
        
        // Search YouTube
        const searchQuery = `${text} official`;
        const searchResult = await yts(searchQuery);
        const video = searchResult.videos[0];
        if (!video) return m.reply(`Nothing found for "${text}". Your taste is as nonexistent as the results.`);

        // Get MP3 from API
        const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl);
        const apiData = response.data;
        if (!apiData.status || !apiData.result || !apiData.result.downloadUrl) throw new Error("The API spat out garbage. No audio for you.");

        const audioUrl = apiData.result.downloadUrl;
        const title = apiData.result.title || "Untitled";
        const artist = video.author.name || "Unknown Artist";
        const thumbnail = apiData.result.thumbnail || video.thumbnail;

        // ✅ Show success reaction
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        // Send audio file with professional DML-MD style
        await client.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title.substring(0, 100)}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: `${artist} | DML-MD`,
                    thumbnailUrl: thumbnail,
                    sourceUrl: video.url,
                    mediaType: 2, // 2 = audio
                    renderLargerThumbnail: true
                },
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403958418756@newsletter',
                    newsletterName: "DML-PLAY",
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

        // Send thumbnail image as newsletter style
        await client.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: `
🎵 *${title}*
👤 Artist: ${artist}
🔗 [Watch on YouTube](${video.url})

💡 Powered by *DML-MD*
            `.trim(),
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403958418756@newsletter',
                    newsletterName: "DML-PLAY",
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: `${title} | ${artist}`,
                    body: "DML-MD Music Service",
                    thumbnailUrl: thumbnail,
                    sourceUrl: video.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

    } catch (error) {
        console.error(`Play error:`, error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        let userMessage = 'Download failed. The universe despises your music taste.';
        if (error.message.includes('API spat')) userMessage = 'The audio service rejected the request.';
        if (error.message.includes('timeout')) userMessage = 'Search timed out. Try a song that exists.';
        await m.reply(`${userMessage}\nError: ${error.message}`);
    }
};
