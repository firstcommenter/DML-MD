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
                { text: `Example Usage: ${prefix}pair 255622220670` },
                { quoted: m }
            );
        }

        try {
            // Waiting message
            await client.sendMessage(
                m.chat,
                { text: `*Wait DML-MD is getting your pair code ...*` },
                { quoted: m }
            );

            // Prepare number
            const number = text.replace(/[^0-9]/g, '');
            const encodedNumber = encodeURIComponent(number);
            const apiUrl = `https://session-dml-md-1.onrender.com/code?number=${encodedNumber}`;

            // Fetch pairing code
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || !data.code) {
                throw new Error("Invalid API response");
            }

            const pairingCode = data.code;

            // RANDOM IMAGE
            const scsFolder = path.join(__dirname, "../Dmlimages");
            let imagePath = null;

            if (fs.existsSync(scsFolder)) {
                const images = fs
                    .readdirSync(scsFolder)
                    .filter(f => /^menu\d+\.jpg$/i.test(f));

                if (images.length > 0) {
                    const randomImage = images[Math.floor(Math.random() * images.length)];
                    imagePath = path.join(scsFolder, randomImage);
                }
            }

            // Send pairing code (with or without image)
            if (imagePath) {
                await client.sendMessage(
                    m.chat,
                    {
                        image: fs.readFileSync(imagePath),
                        caption: pairingCode,
                        contextInfo: {
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363403958418756@newsletter',
                                newsletterName: "DML-PAIR",
                                serverMessageId: 143,
                            },
                        }
                    },
                    { quoted: m }
                );
            } else {
                await client.sendMessage(
                    m.chat,
                    {
                        text: pairingCode,
                        contextInfo: {
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363403958418756@newsletter',
                                newsletterName: "DML-PAIR",
                                serverMessageId: 143,
                            },
                        }
                    },
                    { quoted: m }
                );
            }

            // Instructions
            await client.sendMessage(
                m.chat,
                {
                    text: `Here is your pair code.\nCopy and paste it to the notification above or use *Link Devices*.`
                },
                { quoted: m }
            );

        } catch (error) {
            console.error("Pair command error:", error);
            await client.sendMessage(
                m.chat,
                { text: `Error getting response from API.` },
                { quoted: m }
            );
        }
    }
};
