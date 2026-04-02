const { getSettings, getSudoUsers } = require("../Database/config");

module.exports = async (client, m, store, chatbotpmSetting) => {
    try {
        if (!m || !m.key || !m.message || !m.key.remoteJid.endsWith("@s.whatsapp.net") || m.key.fromMe) {
            return;
        }
        if (!chatbotpmSetting) return;

        const botNumber = await client.decodeJid(client.user.id);
        const sender = m.sender ? await client.decodeJid(m.sender) : null;
        const senderNumber = sender ? sender.split('@')[0] : null;
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

        const { prefix } = await getSettings();
        if (!messageContent || messageContent.startsWith(prefix)) return;

        try {
            const encodedText = encodeURIComponent(messageContent);
            const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodedText}`;

            // Fix 1: Use AbortController for timeout instead of fetch option
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            let response;
            try {
                response = await fetch(apiUrl, { signal: controller.signal });
            } finally {
                clearTimeout(timeoutId);
            }

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            // Fix 2: Log the actual response to debug structure issues
            console.log("ChatbotPM API response:", JSON.stringify(data));

            // Fix 3: Handle multiple possible response structures
            const replyText =
                data?.data ||
                data?.result ||
                data?.reply ||
                data?.message ||
                data?.answer ||
                null;

            if (!replyText) {
                throw new Error(`Unexpected API response structure: ${JSON.stringify(data)}`);
            }

            await client.sendMessage(
                m.key.remoteJid,
                { text: replyText },
                { quoted: m }
            );

        } catch (e) {
            // Fix 4: Distinguish timeout errors from other errors
            const isTimeout = e.name === "AbortError";
            console.error(`DML-MD ChatbotPM Error [${isTimeout ? "TIMEOUT" : "FETCH"}]:`, e.message);

            await client.sendMessage(
                m.key.remoteJid,
                {
                    text: isTimeout
                        ? `╔══❰ *Chatbot Notice* ❱══\n║ ⏱️ Request timed out.\n║ 🔄 Please try again later.\n╚════════════════════╝`
                        : `╔══❰ *Chatbot Notice* ❱══\n║ ⚠️ Oops! Something went wrong.\n║ 🕒 Please try again later.\n╚════════════════════╝`
                },
                { quoted: m }
            );
        }

    } catch (e) {
        console.error("DML-MD ChatbotPM Fatal Error:", e);
    }
};
