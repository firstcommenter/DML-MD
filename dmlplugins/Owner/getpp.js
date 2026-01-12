const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m } = context;
        const sender = m.sender || m.key?.remoteJid; // fallback in case framework uses key.remoteJid
        const from = m.from || m.chat || m.key?.remoteJid;
        const pushname = m.pushName || "User";

        console.log("===== getpp command triggered =====");
        console.log("Sender:", sender);
        console.log("From:", from);
        console.log("Pushname:", pushname);

        try {
            const startTime = Date.now();

            // Random fancy texts
            const fancyTexts = [
                "Behold, the face of a legend!",
                "Looking sharp! Here's your profile pic.",
                "A picture is worth a thousand words.",
                "Caught in 4K! ✨",
                "Your digital reflection, delivered instantly."
            ];
            const randomFancyText = fancyTexts[Math.floor(Math.random() * fancyTexts.length)];

            // Fetch profile picture
            let userProfilePicUrl;
            try {
                console.log("Fetching profile picture...");
                userProfilePicUrl = await client.profilePictureUrl(sender, 'image');
                console.log("Profile picture URL:", userProfilePicUrl);
            } catch (e) {
                console.warn("No profile picture found:", e);
                return await client.sendMessage(from, { text: "You don't seem to have a profile picture for me to fetch!" }, { quoted: m });
            }

            const endTime = Date.now();
            const ping = endTime - startTime;

            const caption = `
*${randomFancyText}*

👤 *User:* ${pushname}
⚡ *Response Time:* ${ping}ms

*🔰 Powered by Dml ✅*
            `.trim();

            console.log("Sending profile picture message...");

            await client.sendMessage(from, {
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

            console.log("Message sent successfully!");

        } catch (e) {
            console.error("Error in getpp command:", e);
            await client.sendMessage(from, { text: `An error occurred: ${e.message}` }, { quoted: m });
        }
    });
}
