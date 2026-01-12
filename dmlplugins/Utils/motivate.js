const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const apiUrl = 'https://apis.davidcyriltech.my.id/random/quotes';
        const { data } = await axios.get(apiUrl);

        let quote = '';
        let author = 'Unknown';

        // ✅ Correct handling
        if (Array.isArray(data.result) && data.result.length > 0) {
            const item = data.result[0]; // random already
            quote = item.quote;
            author = item.author || author;
        }

        if (!quote) {
            console.log('QUOTE API RAW:', JSON.stringify(data, null, 2));
            return m.reply("❌ Couldn't fetch a quote at the moment. Try again later!");
        }

        // RANDOM IMAGE (NO CACHE)
        const imageUrl = `https://picsum.photos/600/600?random=${Date.now()}`;

        const caption = `
✨ *DML-MOTIVATIONAL* ✨

"${quote}"

_— ${author}_

_powered by Dml_
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
