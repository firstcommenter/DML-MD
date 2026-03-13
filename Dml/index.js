const {
  default: DmlConnect,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  downloadContentFromMessage,
  jidDecode,
  proto,
  getContentType,
  makeCacheableSignalKeyStore,
  Browsers,
  generateWAMessageContent,
  generateWAMessageFromContent
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const FileType = require("file-type");
const { exec, spawn, execSync } = require("child_process");
const axios = require("axios");
const chalk = require("chalk");
const figlet = require("figlet");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('../lib/exif.js');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('../lib/botFunctions.js');
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const authenticationn = require('../Auth/auth.js');
const { smsg } = require('../Handler/smsg.js');
const { getSettings, getBannedUsers, banUser } = require("../Database/config.js");

const { botname } = require('../Env/settings.js');
const { DateTime } = require('luxon');
const { commands, totalCommands } = require('../Handler/commandHandler.js');
authenticationn();

const path = require('path');

const sessionName = path.join(__dirname, '..', 'Session');

const groupEvents = require("../Handler/eventHandler.js");
const groupEvents2 = require("../Handler/eventHandler.js");
const connectionHandler = require('../Handler/connectionHandler.js');
const antidelete = require('../Functions/antidelete.js');
const antilink = require('../Functions/antilink.js');
const antistatusmention = require('../Functions/antistatusmention.js');

function cleanupSessionFiles() {
    try {
        if (!fs.existsSync(sessionName)) return;

        const files = fs.readdirSync(sessionName);
        const keepFiles = ['creds.json', 'app-state-sync-version.json', 'pre-key-', 'session-', 'sender-key-', 'app-state-sync-key-'];

        files.forEach(file => {
            const filePath = path.join(sessionName, file);
            const stats = fs.statSync(filePath);

            const shouldKeep = keepFiles.some(pattern => {
                if (pattern.endsWith('-')) return file.startsWith(pattern);
                return file === pattern;
            });

            if (!shouldKeep) {
                const fileAge = Date.now() - stats.mtimeMs;
                const hoursOld = fileAge / (1000 * 60 * 60);

                if (hoursOld > 24) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Cleaned up old file: ${file}`);
                }
            }
        });
    } catch (error) {
        console.error('❌ Session cleanup error:', error.message);
    }
}

async function startDml() {
  setInterval(cleanupSessionFiles, 24 * 60 * 60 * 1000);
  cleanupSessionFiles();

  let settingss = await getSettings();
  if (!settingss) {
    console.log(`❌ DML-MD FAILED TO CONNECT - Settings not found`);
    return;
  }

  const { autobio, mode, anticall } = settingss;

  const { saveCreds, state } = await useMultiFileAuthState(sessionName);

  const client = DmlConnect({
    printQRInTerminal: false,
    syncFullHistory: true,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
    version: [2,3000,1033105955],
    browser: ["Ubuntu", 'Chrome', "20.0.04"],
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: "silent", stream: 'store' }))
    }
  });

  store.bind(client.ev);

  setInterval(() => {
    store.writeToFile("store.json");
  }, 3000);

  // ╔══════════════════════════════════════════╗
  // ║         ROTATING AUTOBIO THEMES          ║
  // ╚══════════════════════════════════════════╝
  if (autobio) {
    const themes = [

      // ── Theme 1: Classic Box ──
      (date) =>
        `╭━━━━━━━━━━━━━━━━━━━━━╮\n` +
        `┃   ${botname} IS ACTIVE 24/7   ┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
        `🕐 ${date.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}\n` +
        `📅 ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}\n\n` +
        `💬 𝙒𝘼𝙏𝙐 𝙉𝙄 𝙈𝙏𝘼𝙅𝙄 𝙏𝙊𝙎𝙃𝘼 🔥`,

      // ── Theme 2: Neon Vibe ──
      (date) =>
        `⚡ ${botname} ⚡\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🔋 Status  ➤ ONLINE 🟢\n` +
        `🌍 Zone    ➤ Nairobi EAT\n` +
        `🕐 Time    ➤ ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' })}\n` +
        `📆 Day     ➤ ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💬 Always Here For You ✨`,

      // ── Theme 3: Matrix / Hacker ──
      (date) =>
        `01001101 01000100 01001100\n` +
        `> SYSTEM  : ${botname}\n` +
        `> STATUS  : [● ACTIVE]\n` +
        `> UPTIME  : 24/7 NON-STOP\n` +
        `> TIME    : ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' })}\n` +
        `> DAY     : ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}\n` +
        `> MODE    : PUBLIC\n` +
        `01001101 01000100 01001100`,

      // ── Theme 4: Aesthetic Minimal ──
      (date) =>
        `${botname}\n` +
        `────────────────────\n` +
        `online  •  24 / 7\n\n` +
        `${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}\n` +
        `${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' })}\n` +
        `────────────────────\n` +
        `𝘢𝘭𝘸𝘢𝘺𝘴 𝘩𝘦𝘳𝘦 𝘧𝘰𝘳 𝘺𝘰𝘶 🌙`,

      // ── Theme 5: Galaxy / Space ──
      (date) =>
        `🌌 ══════ ${botname} ══════ 🌌\n` +
        `✦ 𝐒𝐭𝐚𝐭𝐮𝐬  : 𝐎𝐍𝐋𝐈𝐍𝐄 🟢\n` +
        `✦ 𝐓𝐢𝐦𝐞    : ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' })} ⏰\n` +
        `✦ 𝐃𝐚𝐲     : ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })} 📅\n` +
        `✦ 𝐌𝐨𝐝𝐞    : 𝐏𝐔𝐁𝐋𝐈𝐂 🌍\n` +
        `✦ 𝐕𝐢𝐛𝐞    : 𝐌𝐀𝐗𝐄𝐃 🚀\n` +
        `🌌 ═══════════════════ 🌌`,

      // ── Theme 6: Fire / Hype Mode ──
      (date) =>
        `🔥🔥🔥 ${botname} 🔥🔥🔥\n` +
        `⚡━━━━━━━━━━━━━━━━━━━⚡\n` +
        `💪 RUNNING NON-STOP!\n\n` +
        `📍 Nairobi, Kenya\n` +
        `🕐 ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' })}\n` +
        `📅 ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}\n\n` +
        `🔥 USINIAMBIE SIWEZI 🔥`,

      // ── Theme 7: Royal / Crown ──
      (date) =>
        `👑 ───────────────── 👑\n` +
        `   𝔻𝕄𝕃 𝔹𝕆𝕋 𝕊𝔼ℝ𝕍𝕀ℂ𝔼\n` +
        `👑 ───────────────── 👑\n\n` +
        `💎 Always Active & Ready\n` +
        `⏰ ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' })}\n` +
        `🌟 ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}\n\n` +
        `👑 𝐵𝑜𝓈𝓈 𝐿𝑒𝓋𝑒𝓁 𝒮𝑒𝓇𝓋𝒾𝒸𝑒 👑`,

      // ── Theme 8: Swahili Pride ──
      (date) =>
        `🇹🇿🇰🇪 ${botname} 🇹🇿🇰🇪\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ Niko Mtandaoni Saa Zote\n` +
        `⏰ ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' })}\n` +
        `📅 ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🔥 MTAJI NI UJUZI 🔥`,

      // ── Theme 9: Diamond VIP ──
      (date) =>
        `💠━━━━━━━━━━━━━━━━━━━💠\n` +
        `   ✨ ${botname} ✨\n` +
        `     VIP BOT SERVICE\n` +
        `💠━━━━━━━━━━━━━━━━━━━💠\n` +
        `⚡ Mode    : Public 🌍\n` +
        `🟢 Status  : Online\n` +
        `🕐 Time    : ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' })}\n` +
        `📅 Day     : ${date.toLocaleString('en-US', { weekday: 'long', timeZone: 'Africa/Nairobi' })}\n` +
        `💠━━━━━━━━━━━━━━━━━━━💠`,

      // ── Theme 10: Anime / Cool ──
      (date) =>
        `「 ${botname} 」\n` +
        `┌─────────────────────┐\n` +
        `│ ⚔️  Status  : ONLINE  │\n` +
        `│ 🌙 Mode    : Public  │\n` +
        `│ ⏰ Time    : ${date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' })}  │\n` +
        `│ 📅 Day     : ${date.toLocaleString('en-US', { weekday: 'short', timeZone: 'Africa/Nairobi' })}     │\n` +
        `└─────────────────────┘\n` +
        `🗡️ 𝑵𝒆𝒗𝒆𝒓 𝑶𝒇𝒇𝒍𝒊𝒏𝒆 🗡️`,

    ];

    let themeIndex = 0;

    setInterval(async () => {
      try {
        const date = new Date();
        const bio = themes[themeIndex % themes.length](date);
        await client.updateProfileStatus(bio);
        console.log(chalk.cyan(`🎨 [AUTOBIO] Theme ${(themeIndex % themes.length) + 1} applied`));
        themeIndex++;
      } catch (error) {
        console.error('❌ [AUTOBIO] Failed to update bio:', error.message);
      }
    }, 10 * 1000); // Every 10 seconds (safe WhatsApp limit)
  }

  const processedCalls = new Set();

  client.ws.on('CB:call', async (json) => {
    const settingszs = await getSettings();
    if (!settingszs?.anticall) return;

    const callId = json.content[0].attrs['call-id'];
    const callerJid = json.content[0].attrs['call-creator'];

    const isGroupCall = callerJid.endsWith('@g.us');
    if (isGroupCall) return;

    const callerNumber = callerJid.replace(/[@.a-z]/g, "");

    if (processedCalls.has(callId)) {
      return;
    }
    processedCalls.add(callId);

    const fakeQuoted = {
      key: {
        participant: '0@s.whatsapp.net',
        remoteJid: '0@s.whatsapp.net',
        id: callId
      },
      message: {
        conversation: "Verified"
      },
      contextInfo: {
        mentionedJid: [callerJid],
        forwardingScore: 999,
        isForwarded: true
      }
    };

    await client.rejectCall(callId, callerJid);
    await client.sendMessage(callerJid, {
      text: "> Calling without permission is highly prohibited ⚠️!"
    }, { quoted: fakeQuoted });

    const bannedUsers = await getBannedUsers();
    if (!bannedUsers.includes(callerNumber)) {
      await banUser(callerNumber);
    }
  });

  const processedStatusMessages = new Set();

  client.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    let settings = await getSettings();
    if (!settings) return;

    const { autoread, autolike, autoview, presence, autolikeemoji } = settings;

    let mek = messages[0];
    if (!mek || !mek.key) return;

    const remoteJid = mek.key.remoteJid;
    const sender = client.decodeJid(mek.key.participant || mek.key.remoteJid);

    if (remoteJid === "status@broadcast") {
      if (autolike && mek.key) {
        try {
          let reactEmoji = autolikeemoji || 'random';

          if (reactEmoji === 'random') {
            const emojis = ['❤️', '👍', '🔥', '😍', '👏', '🎉', '🤩', '💯', '✨', '🌟'];
            reactEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          }

          const nickk = client.decodeJid(client.user.id);

          await client.sendMessage(mek.key.remoteJid, { 
            react: { 
              text: reactEmoji, 
              key: mek.key 
            } 
          }, { statusJidList: [mek.key.participant, nickk] });
        } catch (sendError) {
          try {
            await client.sendMessage(mek.key.remoteJid, { 
              react: { 
                text: reactEmoji, 
                key: mek.key 
              } 
            });
          } catch (error2) {
            console.error('❌ [AUTOLIKE] Failed to react:', error2.message);
          }
        }
      }

      if (autoview) {
        try {
          await client.readMessages([mek.key]);

          setTimeout(async () => {
            try {
              await client.readMessages([mek.key]);
            } catch (error) {}
          }, 500);
        } catch (error) {
          console.error('❌ [AUTOVIEW] Failed to view:', error.message);
        }
      }

      return;
    }

    if (!mek.message) return;

    mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;

    if (!mek.message) {
        console.error('❌ [MESSAGE HANDLER] mek.message is undefined');
        return;
    }

    await antilink(client, mek, store);

    if (autoread && remoteJid.endsWith('@s.whatsapp.net')) {
      try {
        await client.readMessages([mek.key]);
      } catch (error) {}
    }

    if (remoteJid.endsWith('@s.whatsapp.net')) {
      const Chat = remoteJid;
      if (presence === 'online') {
        try {
          await client.sendPresenceUpdate("available", Chat);
        } catch (error) {}
      } else if (presence === 'typing') {
        try {
          await client.sendPresenceUpdate("composing", Chat);
        } catch (error) {}
      } else if (presence === 'recording') {
        try {
          await client.sendPresenceUpdate("recording", Chat);
        } catch (error) {}
      } else {
        try {
          await client.sendPresenceUpdate("unavailable", Chat);
        } catch (error) {}
      }
    }

    if (!client.public && !mek.key.fromMe) return;

    try {
      m = smsg(client, mek, store);
      require("./daudi")(client, m, { type: "notify" }, store);
    } catch (error) {
      console.error('❌ [MESSAGE HANDLER] Error:', error.message);
    }
  });

  client.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    if (msg.message.listResponseMessage) {
      const selectedCmd = msg.message.listResponseMessage.singleSelectReply.selectedRowId;

      const settings = await getSettings();
      const effectivePrefix = settings?.prefix || '.';

      let command = selectedCmd.startsWith(effectivePrefix)
        ? selectedCmd.slice(effectivePrefix.length).toLowerCase()
        : selectedCmd.toLowerCase();

      const m = {
        ...msg,
        body: selectedCmd,
        text: selectedCmd,
        command: command,
        prefix: effectivePrefix,
        sender: msg.key.remoteJid,
        from: msg.key.remoteJid,
        chat: msg.key.remoteJid,
        isGroup: msg.key.remoteJid.endsWith('@g.us')
      };

      try {
        require("./daudi")(client, m, { type: "notify" }, store);
      } catch (error) {
        console.error('❌ [LIST SELECTION] Error:', error.message);
      }
    }
  });

  client.ev.on("messages.update", async (updates) => {
    for (const update of updates) {
      if (update.key && update.key.remoteJid === "status@broadcast" && update.update.messageStubType === 1) {
        const settings = await getSettings();
        if (settings.autoview) {
          try {
            const mek = {
              key: update.key,
              message: {}
            };
            await client.readMessages([mek.key]);
          } catch (error) {}
        }
      }
    }
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error('❌ [UNHANDLED ERROR] Unhandled Rejection:', reason.message?.substring(0, 200) || reason);
  });

  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  client.getName = (jid, withoutContact = false) => {
    id = client.decodeJid(jid);
    withoutContact = client.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v = id === "0@s.whatsapp.net"
        ? { id, name: "WhatsApp" }
        : id === client.decodeJid(client.user.id)
          ? client.user
          : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  client.public = true;

  client.serializeM = (m) => smsg(client, m, store);

  client.ev.on("group-participants.update", async (m) => {
    try {
      groupEvents(client, m);
      groupEvents2(client, m);
    } catch (error) {
      console.error('❌ [GROUP EVENT] Error:', error.message);
    }
  });

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 5000;

  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    const reason = lastDisconnect?.error ? new Boom(lastDisconnect.error).output.statusCode : null;

    if (connection === "open") {
      reconnectAttempts = 0;
      console.log(chalk.green(`\n╭───(    DML-𝐌D    )───`));
      console.log(chalk.green(`> ───≫ 🚀 Started Successfully <<───`));
      console.log(chalk.green(`> `) + chalk.white(`\`✅\` 𝐒𝐭𝐚𝐭𝐮𝐬 : `) + chalk.green(`Started Successfully`));
      console.log(chalk.green(`> `) + chalk.white(`\`✅\` 𝐌𝐨𝐝𝐞 : `) + chalk.cyan(`${settingss.mode || 'public'}`));
      console.log(chalk.green(`╰──────────────────☉`));
      console.log(chalk.green(`> NEW\n`));
    }

    if (connection === "close") {
      if (reason === DisconnectReason.loggedOut || reason === 401) {
        await fs.rmSync(sessionName, { recursive: true, force: true });
        return startDml();
      }

      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
        reconnectAttempts++;
        setTimeout(() => startDml(), delay);
      }
    }

    await connectionHandler(client, update, startDml);
  });

  client.ev.on("creds.update", saveCreds);

  client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text: text, ...options }, { quoted });

  client.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };
}

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

startDml();

module.exports = startDml;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
