const middleware = require('../../utility/botUtil/middleware');

module.exports = {
  name: 'all',
  aliases: ['tagall', 'everyone', 'here'],
  description: 'Tags all members in the group',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, participants, text } = context;

      if (!m.isGroup)
        return m.reply('This command only works inside a group.');

      const members = participants.map((a) => a.id);

      await client.sendMessage(
        m.chat,
        {
          text: `@all ${text || ''}`.trim(),
          mentions: members,
        },
        { quoted: m }
      );
    });
  },
};
