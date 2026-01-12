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

        // 📥 Maher-Zubair APK API
        const data = await fetchJson(
            `https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(apkName)}`
        );

        if (!data || data.status !== 200 || !data.result) {
            return m.reply("Sorry, the APK was not found or the server is busy.");
        }

        const apk = data.result;

        // 🖼️ APK info + icon
        const caption = `
✨ *APK DOWNLOADER* ✨

📦 *Name:* ${apk.name}
🏢 *Developer:* ${apk.developer || "Unknown"}
⚖️ *Size:* ${apk.size || "Unknown"}
🕒 *Last Updated:* ${apk.lastUpdate || "Unknown"}

_Please wait, sending APK..._
`;

        if (apk.icon) {
            await client.sendMessage(
                m.chat,
                {
                    image: { url: apk.icon },
                    caption: caption
                },
                { quoted: m }
            );
        } else {
            await m.reply(caption);
        }

        // 📦 Send APK file
        await client.sendMessage(
            m.chat,
            {
                document: { url: apk.downloadLink },
                mimetype: "application/vnd.android.package-archive",
                fileName: `${apk.name}.apk`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        m.reply("APK download failed\n" + error);
    }
};
// dml
