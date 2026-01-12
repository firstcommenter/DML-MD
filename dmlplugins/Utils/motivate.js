const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const apiUrl = 'https://apis.davidcyriltech.my.id/random/quotes';
        const res = await axios.get(apiUrl);
        const data = res.data;

        let quote = '';
        let author = 'Unknown';

        // 🔥 Universal extractor
        const extractQuote = (obj) => {
            if (!obj) return;

            if (typeof obj === 'string' && obj.length > 5) {
                quote = obj;
                return;
            }

            if (typeof obj === 'object') {
                for (const key in obj) {
                    if (key.toLowerCase().includes('quote') && typeof obj[key] === 'string') {
                        quote = obj[key];
                    }
                    if (key.toLowerCase().includes('text') && typeof obj[key] === 'string') {
                        quote = obj[key];
                    }
                    if (key.toLowerCase().includes('author') && typeof obj[key] === 'string') {
                        author = obj[key];
                    }

                    if (!quote) extractQuote(obj[key]);
                }
            }

            if (Array.isArray(obj)) {
                obj.forEach(extractQuote);
            }
        };

        extractQuote(data);

        if (!quote) {
            console.log('QUOTE API RAW:', JSON.stringify(data, null, 2));
            return m.reply("❌ Couldn't fetch a quote at the moment. Try again later!");
        }

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

    } catch (err) {
        console.error('Quote Image Error:', err);
        m.reply("❌ Failed to fetch quote image. Please try again later.");
    }
};
