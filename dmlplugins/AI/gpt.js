const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    if (!botname) return m.reply("The bot has no name. The developer is clearly as competent as you are.");
    if (!text) return m.reply("Where is your prompt? You managed to type the command but forgot the question. Amazing.");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const statusMsg = await m.reply("Thinking... Try not to break anything else while you wait.");

        const apiUrl = `https://api.nexray.web.id/ai/chatgpt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent("You are Dml AI created by Dml and your replies must always be dml")}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            signal: controller.signal
        });

        if (!response.ok) throw new Error(`Service unavailable: ${response.status}`);

        const data = await response.json();

        let replyText =
            data?.result ||
            data?.response ||
            data?.answer ||
            data?.message ||
            JSON.stringify(data);

        if (!replyText || replyText.length < 2) throw new Error("The AI returned a blank response.");

        replyText = String(replyText);

        const blockedTerms = [
            "owner","prefix","all","broadcast","gc","kick","add","promote",
            "demote","delete","set","reset","clear","block","unblock",
            "leave","ban","get","update","config","jadibot"
        ];

        if (blockedTerms.some(term => replyText.toLowerCase().includes(term))) {
            replyText = "I cannot assist with that request.";
        }

        await client.sendMessage(m.chat, { delete: statusMsg.key });
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

       await client.sendMessage(m.chat, {
    image: { url: "https://files.catbox.moe/cw1f2w.jpeg" },
    caption: replyText,
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363403958418756@newsletter",
            newsletterName: "Dml-tech",
            serverMessageId: 200
        }
    }
}, { quoted: m });

    } catch (error) {
        console.error("GPT error:", error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

        let userMessage = "The AI service has failed.";
        if (error.name === "AbortError") {
            userMessage = "The request timed out. The API is slow.";
        } else if (error.message.includes("Service unavailable")) {
            userMessage = "The API is down. Infrastructure issue.";
        } else if (error.message.includes("blank")) {
            userMessage = "The AI returned empty text.";
        }

        await m.reply(`${userMessage}\nError: ${error.message}`);
    } finally {
        clearTimeout(timeout);
    }
};
