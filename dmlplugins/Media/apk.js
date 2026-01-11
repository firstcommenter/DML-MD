module.exports = async (context) => {
  const { client, m, text, fetchJson } = context;

  try {
    if (!text) return m.reply("❌ Provide an app name");

    // Search app
    const search = await fetchJson(
      `https://api.aptoide.com/api/7/apps/search?query=${encodeURIComponent(text)}`
    );

    if (!search?.list || search.list.length === 0) {
      return m.reply("❌ App not found");
    }

    const app = search.list[0];

    const name = app.name;
    const version = app.file?.vername || "Unknown";
    const size = app.file?.filesize
      ? (app.file.filesize / 1024 / 1024).toFixed(2) + " MB"
      : "Unknown";
    const icon = app.icon;
    const download = app.file?.path;

    if (!download) return m.reply("❌ Download link unavailable");

    // Send icon preview with details
    await client.sendMessage(
      m.chat,
      {
        image: { url: icon },
        caption:
          `📦 *${name}*\n` +
          `🔖 Version: ${version}\n` +
          `📊 Size: ${size}\n` +
          `⬇️ Source: Aptoide`,
      },
      { quoted: m }
    );

    // Send APK
    await client.sendMessage(
      m.chat,
      {
        document: { url: download },
        fileName: `${name}.apk`,
        mimetype: "application/vnd.android.package-archive",
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    m.reply("❌ Apk download failed\n" + err.message);
  }
};
// dml
