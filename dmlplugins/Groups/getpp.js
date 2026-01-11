/**
 * Get profile picture of a user (reply in group or DM)
 * @module getpp
 */

module.exports = {
  name: 'getpp',
  aliases: ['pp'],
  description: 'Get profile picture of a user',
  run: async (context) => {
    const {
      client,
      m,
      IsGroup,
      reply
    } = context;

    try {
      let targetJid;

      // GROUP: must reply
      if (IsGroup) {
        const quotedParticipant =
          m.message?.extendedTextMessage?.contextInfo?.participant;
        const quotedMessage =
          m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quotedParticipant || !quotedMessage) {
          return reply('❌ Please reply to someone to get their profile picture.');
        }

        targetJid = quotedParticipant;
      } 
      // DM
      else {
        targetJid = m.chat.endsWith('@s.whatsapp.net')
          ? m.chat
          : m.sender;
      }

      let imageUrl;
      try {
        imageUrl = await client.profilePictureUrl(targetJid, 'image');
      } catch {
        imageUrl = 'https://files.catbox.moe/z2rr5a.jpg';
      }

      // Fake vCard (status-style quote)
      const fakeVCard = {
        key: {
          fromMe: false,
          participant: '0@s.whatsapp.net',
          remoteJid: 'status@broadcast'
        },
        message: {
          contactMessage: {
            displayName: 'DML TECH ✅',
            vcard:
`BEGIN:VCARD
VERSION:3.0
FN:DML-TECH ✅
ORG:DML-MD;
TEL;type=CELL;type=VOICE;waid=255700000000:+255700000000
END:VCARD`,
            jpegThumbnail: Buffer.from([])
          }
        }
      };

      await client.sendMessage(
        m.chat,
        {
          image: { url: imageUrl },
          caption: `✅ Profile Picture of @${targetJid.split('@')[0]}`,
          contextInfo: {
            mentionedJid: [targetJid],
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: 'DML-TEAM',
              newsletterJid: '120363403958418756@newsletter'
            }
          }
        },
        { quoted: fakeVCard }
      );

    } catch (err) {
      console.error('getpp error:', err);
      reply('❌ Failed to fetch profile picture.');
    }
  }
};
