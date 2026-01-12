const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const apiUrl = 'https://apis.davidcyriltech.my.id/random/quotes';
        const { data } = await axios.get(apiUrl);

        // validate response
        if (!data.status || !data.result) {
            return m.reply("❌ Couldn't fetch a quote at the moment. Try again later!");
        }

        const { quote, author } = data.result;

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
