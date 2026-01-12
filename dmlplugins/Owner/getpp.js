const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m } = context;
        const sender = m.sender; // WhatsApp ID of the sender
        const from = m.from;     // Chat ID

        try {
            const startTime = Date.now();
            const pushname = m.pushName || "User";

            // Fancy texts
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
                userProfilePicUrl = await client.profilePictureUrl(sender, 'image');
            } catch {
                return await client.sendMessage(from, { text: "You don't seem to have a profile picture for me to fetch!" }, { quoted: m });
            }

            const endTime = Date.now();
            const ping = endTime - startTime;

            // Caption
            const caption = `
*${randomFancyText}*

👤 *User:* ${pushname}
⚡ *Response Time:* ${ping}ms

*🔰 Powered by Dml ✅*
            `.trim();

            // Send image
            await client.sendMessage(from, {
                image: { url: userProfilePicUrl },
                caption: caption,
                contextInfo: {
                    mentionedJid: [sender]
                }
            }, { quoted: m });

        } catch (e) {
            console.error("Error in getpp command:", e);
            await client.sendMessage(from, { text: `An error occurred: ${e.message}` }, { quoted: m });
        }
    });
}
