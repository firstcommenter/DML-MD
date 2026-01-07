const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'pair',
    aliases: ['code', 'session', 'qrcode'],
    description: 'Get WhatsApp pairing code',
    run: async (context) => {
        const { client, m, text, prefix } = context;

        if (!text) {
            return await client.sendMessage(
                m.chat,
                { text: `Example Usage:\n${prefix}pair 255622220670` },
                { quoted: m }
            );
        }

        try {
            // Waiting message
            await client.sendMessage(
                m.chat,
                { text: `⏳ *DML-MD is generating your pairing code...*` },
                { quoted: m }
            );

            // Prepare number
            const number = text.replace(/[^0-9]/g, '');
            const apiUrl = `https://session-dml-md-1.onrender.com/code?number=${encodeURIComponent(number)}`;

            // API request
            const { data } = await axios.get(apiUrl);
            if (!data || !data.code) throw new Error('Invalid API response');

            const pairingCode = data.code;

            // ===============================
            // RANDOM IMAGE
            // ===============================
            const imagesDir = path.join(__dirname, '../Dmlimages');
            let media = null;

            if (fs.existsSync(imagesDir)) {
                const images = fs.readdirSync(imagesDir).filter(f =>
                    /^menu\d+\.jpg$/i.test(f)
                );
                if (images.length > 0) {
                    const random = images[Math.floor(Math.random() * images.length)];
                    media = fs.readFileSync(path.join(imagesDir, random));
                }
            }

            // ===============================
            // CTA COPY MESSAGE
            // ===============================
            const message = {
                caption: `🔑 *Your Pairing Code*\n\n${pairingCode}\n\n📌 Tap the button below to copy`,
                footer: 'DML-MD Pair Service',
                headerType: 4,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403958418756@newsletter',
                        newsletterName: 'DML-PAIR',
                        serverMessageId: 143,
                    },
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📋 Copy Code',
                                copy_code: pairingCode
                            })
                        }
                    ]
                }
            };

            if (media) {
                message.image = media;
            } else {
                message.text = message.caption;
                delete message.caption;
            }

            await client.sendMessage(m.chat, message, { quoted: m });

        } catch (err) {
            console.error('PAIR ERROR:', err);
            await client.sendMessage(
                m.chat,
                { text: '❌ Failed to get pairing code. Please try again later.' },
                { quoted: m }
            );
        }
    }
};
