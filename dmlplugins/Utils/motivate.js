const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const apiUrl = 'https://apis.davidcyriltech.my.id/random/quotes';
        const res = await axios.get(apiUrl);
        const data = res.data;

        // DEBUG (remove later)
        console.log('QUOTE API RESPONSE:', data);

        // handle multiple possible structures
        let quote, author;

        if (data.result) {
            quote = data.result.quote;
            author = data.result.author;
        } else if (data.quote) {
            quote = data.quote;
            author = data.author;
        } else if (Array.isArray(data) && data[0]) {
            quote = data[0].quote;
            author = data[0].author;
        }

        if (!quote) {
            return m.reply("❌ Couldn't fetch a quote at the moment. Try again later!");
        }

        const quoteMessage = `
✨ *DML-MOTIVATIONAL* ✨

"${quote}"

_— ${author || 'Unknown'}_

_powered by DML_
`.trim();

        await client.sendMessage(
            m.chat,
            { text: quoteMessage },
            { quoted: m }
        );

    } catch (error) {
        console.error('Motivation Error:', error);
        m.reply("❌ Failed to fetch a motivational quote. Please try again later.");
    }
};
