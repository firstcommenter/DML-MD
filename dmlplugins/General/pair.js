const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'pair',
    aliases: ['code', 'session', 'qrcode'],
    description: 'Get WhatsApp pairing code',
    run: async (context) => {
        const { client, m, text, prefix } = context;

        // Validate input
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

            // Clean number
            const number = text.replace(/[^0-9]/g, '');
            const apiUrl = `https://session-dml-md-1.onrender.com/code?number=${encodeURIComponent(number)}`;

            // Request API
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || !data.code) {
                throw new Error('Invalid API response');
            }

            const pairingCode = data.code;

            // ===============================
            // RANDOM IMAGE SECTION
            // ===============================
            const imagesFolder = path.join(__dirname, '../Dmlimages');
            let imageBuffer = null;

            if (fs.existsSync(imagesFolder)) {
                const images = fs
                    .readdirSync(imagesFolder)
                    .filter(f => /^menu\d+\.jpg$/i.test(f));

                if (images.length > 0) {
                    const randomImage = images[Math.floor(Math.random() * images.length)];
                    imageBuffer = fs.readFileSync(path.join(imagesFolder, randomImage));
                }
            }

            // ===============================
            // SEND MESSAGE (IMAGE + BUTTON)
            // ===============================
            const messageData = {
                caption: `🔑 *Your Pairing Code*\n\n${pairingCode}\n\n📌 Copy and paste this code in *Link Devices*`,
                footer: 'DML-MD Pair Service',
                buttons: [
                    {
                        buttonId: `copy_${pairingCode}`,
                        buttonText: { displayText: '📋 Copy Code' },
                        type: 1
                    }
                ],
                headerType: 4,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403958418756@newsletter',
                        newsletterName: 'DML-PAIR',
                        serverMessageId: 143,
                    },
                }
            };

            // Attach image if exists
            if (imageBuffer) {
                messageData.image = imageBuffer;
            } else {
                messageData.text = messageData.caption;
                delete messageData.caption;
            }

            await client.sendMessage(
                m.chat,
                messageData,
                { quoted: m }
            );

        } catch (error) {
            console.error('PAIR ERROR:', error);
            await client.sendMessage(
                m.chat,
                { text: '❌ Failed to get pairing code. Try again later.' },
                { quoted: m }
            );
        }
    }
};
