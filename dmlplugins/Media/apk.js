module.exports = async (context) => {
  const { client, m, text, fetchJson } = context;

  try {
    if (!text) return m.reply("❌ Provide an app name");

    const res = await fetchJson(
      `https://api.aptoide.com/api/7/apps/search?query=${encodeURIComponent(text)}`
    );

    // ✅ Correct Aptoide response path
    const apps = res?.datalist?.list;

    if (!apps || apps.length === 0) {
      return m.reply("❌ App not found on Aptoide");
    }

    const app = apps[0];

    const name = app.name || "Unknown App";
    const icon = app.icon;
    const version = app.file?.vername || "Unknown";
    const size = app.file?.filesize
      ? (app.file.filesize / 1024 / 1024).toFixed(2) + " MB"
      : "Unknown";
    const download = app.file?.path;

    if (!download) return m.reply("❌ Download link unavailable");

    // 📸 Icon preview
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

    // 📥 Send APK
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
