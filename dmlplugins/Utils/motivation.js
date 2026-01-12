const axios = require('axios');

module.exports = async (context) => {
    const { client, m } = context;

    try {
        const apiUrl = 'https://apis.davidcyriltech.my.id/random/quotes';
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.response) {
            return m.reply("❌ Couldn't fetch a quote at the moment. Try again later!");
        }

        const quoteMessage = `
✨ *DML-MOTIVATIONAL* ✨

"${data.response.quote}"

_— ${data.response.author}_

_powered by Dml_
`.trim();

        await client.sendMessage(m.chat, { text: quoteMessage }, { quoted: m });

    } catch (error) {
        console.error('Motivation Error:', error);
        m.reply("❌ Failed to fetch a motivational quote. Please try again later.");
    }
};
