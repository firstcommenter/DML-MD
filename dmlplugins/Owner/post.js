module.exports = async (context) => {
    const { client, m } = context;

    try {
        // Only allow bot owner
        if (!m.fromMe) return m.reply("*📛 Owner only command*");

        const quoted = m.quoted || m;

        // 1️⃣ Handle Text Status
        if (quoted.text && !quoted.hasMedia) {
            try {
                await client.setStatus(quoted.text);
                return m.reply("✅ Text status updated");
            } catch (e) {
                return m.reply("❌ Failed to update text status");
            }
        }

        // 2️⃣ Handle Media Status
        if (quoted.hasMedia) {
            try {
                const media = await quoted.download();
                const caption = quoted.caption || "";

                // Send to WhatsApp status
                await client.sendMessage("status@broadcast", {
                    [quoted.type.replace("Message", "")]: media,
                    caption: caption
                });

                // Optional fallback: update profile picture
                // await client.setProfilePicture(media);

                return m.reply("✅ Media posted to status");
            } catch (error) {
                return m.reply(`❌ Error: ${error.message}`);
            }
        }

        return m.reply("⚠ Please reply to media or text");

    } catch (error) {
        console.error(error);
        m.reply(`❌ Unexpected error: ${error.message}`);
    }
};
