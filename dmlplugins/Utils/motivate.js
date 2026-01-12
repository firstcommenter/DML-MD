const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        // QUOTE API
        const quoteApi = 'https://apis.davidcyriltech.my.id/random/quotes';
        const { data } = await axios.get(quoteApi);

        let quote = '';
        let author = 'Unknown';

        if (data?.result?.quote) {
            if (typeof data.result.quote === 'string') {
                quote = data.result.quote;
                author = data.result.author || author;
            } else if (typeof data.result.quote === 'object') {
                quote = data.result.quote.text || data.result.quote.quote || '';
                author = data.result.quote.author || data.result.author || author;
            }
        }

        if (!quote) {
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
