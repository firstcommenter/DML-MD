const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const apiUrl = 'https://apis.davidcyriltech.my.id/random/quotes';
        const { data } = await axios.get(apiUrl);

        console.log('QUOTE API RAW:', JSON.stringify(data, null, 2));

        let quote = '';
        let author = 'Unknown';

        // Most common structure
        if (data.result) {
            if (typeof data.result.quote === 'string') {
                quote = data.result.quote;
                author = data.result.author || author;
            } else if (typeof data.result.quote === 'object') {
                quote =
                    data.result.quote.text ||
                    data.result.quote.quote ||
                    data.result.quote.message ||
                    JSON.stringify(data.result.quote);
                author =
                    data.result.quote.author ||
                    data.result.author ||
                    author;
            }
        }

        // Fallback
        if (!quote && data.quote) {
            if (typeof data.quote === 'string') {
                quote = data.quote;
                author = data.author || author;
            } else if (typeof data.quote === 'object') {
                quote =
                    data.quote.text ||
                    data.quote.quote ||
                    JSON.stringify(data.quote);
                author = data.quote.author || author;
            }
        }

        if (!quote) {
            return m.reply("❌ Couldn't fetch a quote at the moment. Try again later!");
        }

        // Random image URL with no cache
        const imageUrl = `https://picsum.photos/600/600?random=${Date.now()}`;

        const quoteMessage = `
✨ *DML-MOTIVATIONAL* ✨

"${quote}"

_— ${author}_

_powered by DML_
        `.trim();

        // Send image + caption
        await client.sendMessage(
            m.chat,
            {
                image: { url: imageUrl },
                caption: quoteMessage
            },
            { quoted: m }
        );

    } catch (error) {
        console.error('Motivation Error:', error);
        m.reply("❌ Failed to fetch a motivational quote. Please try again later.");
    }
};
