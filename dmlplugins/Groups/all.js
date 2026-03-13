const middleware = require('../../utility/botUtil/middleware');

module.exports = {
  name: 'all',
  aliases: ['tagall', 'everyone', 'here'],
  description: 'Tags all members in the group silently',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, participants, text } = context;

      if (!m.isGroup)
        return m.reply(
          `╔══════════════════════════════╗\n` +
          `║  ⚠️  ERROR                    ║\n` +
          `╠══════════════════════════════╣\n` +
          `║  This command only works     ║\n` +
          `║  inside a group chat.        ║\n` +
          `╚══════════════════════════════╝`
        );

      const members = participants.map((a) => a.id);
      const total   = members.length;

      // ── invisible mention chars (one per member) ────────────
      // Each \u200B is a zero-width space that still triggers a mention
      const silentMentions = members.map(() => '\u200B').join('');

      const body =
        `╔══════════════════════════════╗\n` +
        `║  📢  GROUP PING              ║\n` +
        `╠══════════════════════════════╣\n` +
        `║  MEMBERS  » ${String(total).padEnd(17)}║\n` +
        `║  BOT      » DML-MD           ║\n` +
        (text
          ? `╠══════════════════════════════╣\n` +
            `║  ${text.slice(0, 28).padEnd(28)}║\n`
          : '') +
        `╚══════════════════════════════╝\n` +
        silentMentions;

      await client.sendMessage(
        m.chat,
        { text: body, mentions: members },
        { quoted: m }
      );
    });
  },
};
