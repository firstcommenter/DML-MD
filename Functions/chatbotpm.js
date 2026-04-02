const { getSettings, getSudoUsers } = require("../Database/config");

module.exports = async (client, m, store, chatbotpmSetting) => {
    try {
        if (
            !m ||
            !m.key ||
            !m.message ||
            !m.key.remoteJid?.endsWith("@s.whatsapp.net") ||
            m.key.fromMe
        ) {
            return;
        }

        if (!chatbotpmSetting) return;

        const botNumber = await client.decodeJid(client.user.id);
        const sender = m.sender ? await client.decodeJid(m.sender) : null;
        const senderNumber = sender ? sender.split("@")[0] : null;

        if (!sender || !senderNumber) return;

        const sudoUsers = await getSudoUsers();
        if (sudoUsers.includes(senderNumber) || sender === botNumber) return;

        const messageContent = (
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            ""
        ).trim();

        const settings = await getSettings();
        const prefix = settings?.prefix || ".";

        if (!messageContent || messageContent.startsWith(prefix)) return;

        try {
            const encodedText = encodeURIComponent(messageContent);
            const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodedText}`;

            const response = await fetch(apiUrl, {
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== "success" || !data.data) {
                throw new Error("Invalid API response: missing status or data");
            }

            await client.sendMessage(
                m.key.remoteJid,
                { text: String(data.data) },
                { quoted: m }
            );
        } catch (e) {
            console.error("DML-MD ChatbotPM Error:", e);
            await client.sendMessage(
                m.key.remoteJid,
                {
                    text: `╔══❰ *Chatbot Notice* ❱══
║ ⚠️ Oops! Something went wrong with the chatbot.
║ 🕒 Please try again later.
╚══════════════════════╝`
                },
                { quoted: m }
            );
        }
    } catch (e) {
        console.error("DML-MD ChatbotPM Error:", e);
    }
};
