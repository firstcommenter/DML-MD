module.exports = async (context) => {
    const { client, m, text, fetchJson } = context;

    try {
        if (!text) {
            return m.reply(
                "Please provide the name of the app you want to download.\n\nExample: .playstore facebook"
            );
        }

        const appName = text.trim();

        // 🔍 Searching
        await m.reply(`🔍 Searching for *${appName}* on Play Store...`);

        // 📥 Maher-Zubair APK API
        const data = await fetchJson(
            `https://api.maher-zubair.tech/download/apk?id=${encodeURIComponent(appName)}`
        );

        if (!data || data.status !== 200 || !data.result) {
            return m.reply("Sorry, the app was not found or the server is busy.");
        }

        const app = data.result;

        // 🖼️ App info + icon
        const caption = `
✨ *DML PLAYSTORE DOWNLOADER* ✨

📦 *Name:* ${app.name}
🏢 *Developer:* ${app.developer || "Unknown"}
⚖️ *Size:* ${app.size || "Unknown"}
🕒 *Last Updated:* ${app.lastUpdate || "Unknown"}

_Please wait, sending APK..._
`;

        if (app.icon) {
            await client.sendMessage(
                m.chat,
                {
                    image: { url: app.icon },
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
                document: { url: app.downloadLink },
                mimetype: "application/vnd.android.package-archive",
                fileName: `${app.name}.apk`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        m.reply("Apk download failed\n" + error);
    }
};
// dml
