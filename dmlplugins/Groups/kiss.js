module.exports = {
  name: 'kiss',
  aliases: ['smooch', 'peck'],
  description: 'Kisses a tagged or quoted user with a stylish reaction',
  run: async (context) => {
    const { client, m } = context;

    try {
      console.log(
        `Kiss command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(
          m.mentionedJid
        )}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`
      );

      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error('No tagged or quoted user provided');
          return m.reply(
            `╭━━━〔 💋 KISS SYSTEM 〕━━━⬣
┃ ⚠️ No target detected.
┃
┃ Please tag someone or reply to their message
┃ to send a kiss.
╰━━━━━━━━━━━━━━━━━━⬣`
          );
        }
      }

      const targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      console.log(`Target JID: ${targetUser}`);

      if (
        !targetUser ||
        typeof targetUser !== 'string' ||
        (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))
      ) {
        console.error(`Invalid target user: ${JSON.stringify(targetUser)}`);
        return m.reply(
          `╭━━━〔 ❌ KISS ERROR 〕━━━⬣
┃ Invalid user detected.
┃
┃ Tag or quote a valid user to continue.
╰━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      const targetNumber = targetUser.split('@')[0];
      const senderNumber = m.sender.split('@')[0];

      if (!targetNumber || !senderNumber) {
        console.error(`Failed to extract numbers: target=${targetUser}, sender=${m.sender}`);
        return m.reply(
          `╭━━━〔 ⚠️ SYSTEM ERROR 〕━━━⬣
┃ Failed to process user details.
┃ Please try again.
╰━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      const kissingMsg = await client.sendMessage(
        m.chat,
        {
          text: `╭━━〔 💞 KISS IN PROGRESS 〕━━⬣
┃ @${senderNumber} is moving closer to @${targetNumber}...
┃ A sweet moment is loading 💋
╰━━━━━━━━━━━━━━━━━━━━⬣`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      const intensities = [
        {
          level: 'Soft Kiss',
          description: 'A gentle and shy kiss that left @TARGET smiling softly.',
          emoji: '😊💋',
        },
        {
          level: 'Romantic Kiss',
          description: 'A warm romantic kiss that made @TARGET blush instantly.',
          emoji: '🥰💖',
        },
        {
          level: 'Passionate Kiss',
          description: 'A deep passionate kiss that left @TARGET completely speechless.',
          emoji: '🔥💋',
        },
      ];

      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      const resultMsg = `╭━━〔 💋 KISS REPORT 〕━━⬣
┃ ${intensity.emoji}
┃
┃ 👤 *Kisser:* @${senderNumber}
┃ 🎯 *Target:* @${targetNumber}
┃ 💥 *Type:* ${intensity.level}
┃
┃ 📝 *Result:*
┃ ${intensity.description.replace('@TARGET', `@${targetNumber}`)}
┃
┃ ✨ A memorable kiss has been delivered successfully.
╰━━━━━━━━━━━━━━━━━━⬣`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      if (kissingMsg && kissingMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: kissingMsg.key });
        } catch (deleteError) {
          console.error(`Failed to delete kissing message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Kiss command exploded: ${error.stack}`);
      await m.reply(
        `╭━━━〔 ❌ KISS FAILED 〕━━━⬣
┃ Something went wrong while sending the kiss.
┃ Please try again later.
╰━━━━━━━━━━━━━━━━━━⬣`
      );
    }
  },
};
