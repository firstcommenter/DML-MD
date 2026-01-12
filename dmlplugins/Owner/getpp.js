const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, sender } = context;

        try {
            const startTime = Date.now();
            const pushname = m.pushName || "User";

            // Array of random fancy texts
            const fancyTexts = [
                "Behold, the face of a legend!",
                "Looking sharp! Here's your profile pic.",
                "A picture is worth a thousand words.",
                "Caught in 4K! ✨",
                "Your digital reflection, delivered instantly."
            ];
            const randomFancyText = fancyTexts[Math.floor(Math.random() * fancyTexts.length)];

            // Fetch the profile picture URL
            let userProfilePicUrl;
            try {
                userProfilePicUrl = await client.profilePictureUrl(sender, 'image');
            } catch {
                return m.reply("You don't seem to have a profile picture for me to fetch!");
            }

            const endTime = Date.now();
            const ping = endTime - startTime;

            // Construct the final caption
            const caption = `
*${randomFancyText}*

👤 *User:* ${pushname}
⚡ *Response Time:* ${ping}ms

*🔰 Powered by Dml ✅*
            `.trim();

            // Send the profile picture with context info
            await client.sendMessage(m.from, {
                image: { url: userProfilePicUrl },
                caption: caption,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403958418756@newsletter',
                        newsletterName: 'DML-PROFILE',
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

        } catch (e) {
            console.error("Error in getpp command:", e);
            m.reply(`An error occurred: ${e.message}`);
        }
    });
}
