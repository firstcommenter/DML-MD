const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const apiUrl = 'https://apis.davidcyriltech.my.id/random/quotes';
        const { data } = await axios.get(apiUrl, { timeout: 10000 });

        // 🔍 Handle multiple possible API structures
        let quote = null;
        let author = 'Unknown';

        if (data?.result) {
            if (typeof data.result === 'object') {
                quote =
                    data.result.quote ||
                    data.result.text ||
                    data.result.message;

                author =
                    data.result.author ||
                    data.result.by ||
                    author;
            }
        }

        if (!quote || typeof quote !== 'string') {
            console.log('QUOTE API RAW RESPONSE:\n', JSON.stringify(data, null, 2));
            return m.reply("❌ Couldn't fetch a quote at the moment. Try again later!");
        }

        // 🖼️ Random image (no cache)
        const imageUrl = `https://picsum.photos/600/600?random=${Date.now()}`;

        const caption = `
✨ *DML-MOTIVATIONAL* ✨

"${quote}"

_— ${author}_

_powered by DML_
        `.trim();

        await client.sendMessage(
            m.chat,
            {
                image: { url: imageUrl },
                caption
            },
            { quoted: m }
        );

    } catch (err) {
        console.error('Quote Image Error:', err?.message || err);
        m.reply("❌ Failed to fetch quote image. Please try again later.");
    }
};
