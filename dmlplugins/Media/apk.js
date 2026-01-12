module.exports = async (context) => {
    const { client, m, text, fetchJson } = context;

    try {
        if (!text) {
            return m.reply(
                "Please provide the name of the APK you want to download.\n\nExample: .apk facebook"
            );
        }

        const apkName = text.trim();

        // 🔍 Searching
        await m.reply(`🔍 Searching for *${apkName}* APK...`);

        // ✅ Correct Aptoide API
        const data = await fetchJson(
            `https://api.aptoide.com/api/7/apps/search?query=${encodeURIComponent(apkName)}`
        );

        if (
            !data ||
            !data.datalist ||
            !data.datalist.list ||
            data.datalist.list.length === 0
        ) {
            return m.reply("❌ APK not found.");
        }

        // Take first result
        const apk = data.datalist.list[0];

        const caption = `
✨ *APK DOWNLOADER* ✨

📦 *Name:* ${apk.name}
🏢 *Developer:* ${apk.developer?.name || "Unknown"}
⚖️ *Size:* ${apk.file?.filesize
            ? (apk.file.filesize / (1024 * 1024)).toFixed(2) + " MB"
            : "Unknown"}
🕒 *Version:* ${apk.file?.vername || "Unknown"}

_Please wait, sending APK..._
`;

        // 🖼️ Send icon + info
        if (apk.icon) {
            await client.sendMessage(
                m.chat,
                {
                    image: { url: apk.icon },
                    caption
                },
                { quoted: m }
            );
        } else {
            await m.reply(caption);
        }

        // 📦 Send APK file
        if (!apk.file?.path) {
            return m.reply("❌ Download link not available.");
        }

        await client.sendMessage(
            m.chat,
            {
                document: { url: apk.file.path },
                mimetype: "application/vnd.android.package-archive",
                fileName: `${apk.name}.apk`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        m.reply("❌ APK download failed:\n" + error.message);
    }
};
// dml
