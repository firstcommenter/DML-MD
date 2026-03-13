module.exports = {
  name: 'hug',
  aliases: ['cuddle', 'embrace'],
  description: 'Hugs a tagged or quoted user with a stylish reaction',
  run: async (context) => {
    const { client, m } = context;

    try {
      console.log(
        `Hug command context: isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(
          m.mentionedJid
        )}, quotedSender=${m.quoted?.sender || 'none'}, sender=${m.sender}`
      );

      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        if (!m.quoted || !m.quoted.sender) {
          console.error('No tagged or quoted user provided');
          return m.reply(
            `╭━━━〔 🤗 HUG SYSTEM 〕━━━⬣
┃ ⚠️ No target detected.
┃
┃ Please tag someone or reply to their message
┃ to send a warm hug.
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
          `╭━━━〔 ❌ HUG ERROR 〕━━━⬣
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

      const huggingMsg = await client.sendMessage(
        m.chat,
        {
          text: `╭━━━〔 💞 HUG IN PROGRESS 〕━━━⬣
┃ @${senderNumber} is giving @${targetNumber} a warm hug...
┃ A wholesome moment is loading 🤗
╰━━━━━━━━━━━━━━━━━━━━⬣`,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      const intensities = [
        {
          level: 'Gentle Hug',
          description: 'A soft and comforting hug that made @TARGET feel safe and relaxed.',
          emoji: '🤗✨',
        },
        {
          level: 'Warm Hug',
          description: 'A warm heartfelt hug that instantly brightened @TARGET’s mood.',
          emoji: '🥰💞',
        },
        {
          level: 'Bear Hug',
          description: 'A strong loving bear hug that completely wrapped @TARGET in affection.',
          emoji: '💪🤎',
        },
      ];

      const intensity = intensities[Math.floor(Math.random() * intensities.length)];

      const resultMsg = `╭━━━〔 🤗 HUG REPORT 〕━━━⬣
┃ ${intensity.emoji}
┃
┃ 👤 *Hugger:* @${senderNumber}
┃ 🎯 *Target:* @${targetNumber}
┃ 💥 *Type:* ${intensity.level}
┃
┃ 📝 *Result:*
┃ ${intensity.description.replace('@TARGET', `@${targetNumber}`)}
┃
┃ ✨ A wholesome hug has been delivered successfully.
╰━━━━━━━━━━━━━━━━━━⬣`;

      await client.sendMessage(
        m.chat,
        {
          text: resultMsg,
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      if (huggingMsg && huggingMsg.key) {
        try {
          await client.sendMessage(m.chat, { delete: huggingMsg.key });
        } catch (deleteError) {
          console.error(`Failed to delete hugging message: ${deleteError.stack}`);
        }
      }
    } catch (error) {
      console.error(`Hug command exploded: ${error.stack}`);
      await m.reply(
        `╭━━━〔 ❌ HUG FAILED 〕━━━⬣
┃ Something went wrong while sending the hug.
┃ Please try again later.
╰━━━━━━━━━━━━━━━━━━⬣`
      );
    }
  },
};
