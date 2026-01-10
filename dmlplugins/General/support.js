module.exports = async (context) => {
    const { client, m, text, botname, prefix = '' } = context;

    if (text) {
        return client.sendMessage(
            m.chat,
            {
                text: `Hello ${m.pushName}, just type *${prefix}support* to see all official support & follow links.`
            },
            { quoted: m }
        );
    }

    try {
        const replyText =
            `*🤝 ${botname} Support & Official Links*\n\n` +
            `Follow, subscribe, and join our official platforms to get:\n` +
            `• Updates & Announcements\n` +
            `• Bot Features & Fixes\n` +
            `• Tech Tutorials & Support\n\n` +
            `Select an option below 👇`;

        await client.sendMessage(
            m.chat,
            {
                interactiveMessage: {
                    header: `📢 ${botname} Support`,
                    title: replyText,
                    footer: `Powered by ${botname}`,
                    buttons: [
                        // WhatsApp Channels
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📢 Follow Dml WhatsApp Channel',
                                url: 'https://whatsapp.com/channel/0029VbBf4Y52kNFkFCx2pF1H'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📣 Follow Duduu Mendez Wa Channel',
                                url: 'https://whatsapp.com/channel/0029VacgCaPKmCPGmTmrnT04'
                            })
                        },

                        // GitHub & YouTube
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '💻 Follow Dml on GitHub',
                                url: 'https://github.com/MLILA17'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '▶️ Dml YouTube Channel ',
                                url: 'https://www.youtube.com/@DaudyMussa-h1r'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '▶️ Duduu Mendez YouTube Channel',
                                url: 'https://youtube.com/@duduu_mendez?si=k7TYO2vaQQVQ1x6Q'
                            })
                        },

                        // Telegram
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📡 Join Telegram Channel',
                                url: 'https://t.me/dmltechTz'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '👥 Join Telegram Group',
                                url: 'https://t.me/Dml_Tech7'
                            })
                        }
                    ]
                }
            },
            { quoted: m }
        );

    } catch (error) {
        console.error('Error in support command:', error);
        await client.sendMessage(
            m.chat,
            {
                text: `❌ Failed to load support links.\nPlease try again later.`
            },
            { quoted: m }
        );
    }
};
