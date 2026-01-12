const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const apiUrl = 'https://apis.davidcyriltech.my.id/random/quotes';
        const res = await axios.get(apiUrl);
        const data = res.data;

        // ✅ DIRECT extraction
        const quote = data?.result?.quote;
        const author = data?.result?.author || 'Unknown';

        if (!quote || typeof quote !== 'string') {
            console.log('QUOTE API RAW:', JSON.stringify(data, null, 2));
            return m.reply("❌ Couldn't fetch a quote at the moment. Try again later!");
        }

        // RANDOM IMAGE (NO CACHE)
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

    } catch (error) {
        console.error('Quote Image Error:', error);
        m.reply("❌ Failed to fetch quote image. Please try again later.");
    }
};
