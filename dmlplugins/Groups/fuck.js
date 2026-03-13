module.exports = {
  name: 'fuck',
  aliases: ['screw', 'bang'],
  description: 'Sends a dml, realistic "fuck" reaction to a tagged or quoted user',
  run: async (context) => {
    const { client, m } = context;

    // ── helpers ──────────────────────────────────────────────
    const box = (lines) =>
      `╔${'═'.repeat(30)}╗\n` +
      lines.map((l) => `║  ${l.padEnd(28)}║`).join('\n') +
      `\n╚${'═'.repeat(30)}╝`;

    const err = (msg) => m.reply(box([`⚠️  ERROR`, ``, msg]));

    // ── validation ───────────────────────────────────────────
    try {
      if (!m.mentionedJid?.length && !m.quoted?.sender)
        return err('Tag or quote someone first, perv.');

      const targetUser = m.mentionedJid?.[0] ?? m.quoted?.sender ?? null;

      if (
        !targetUser ||
        typeof targetUser !== 'string' ||
        (!targetUser.includes('@s.whatsapp.net') && !targetUser.includes('@lid'))
      )
        return err('Invalid user. Tag a real person!');

      const target = targetUser.split('@')[0];
      const sender = m.sender.split('@')[0];

      if (!target || !sender)
        return err('Broken user IDs. Try again.');

      // ── intro message ───────────────────────────────────────
      const introMsg = await client.sendMessage(
        m.chat,
        {
          text: box([
            `😈  INCOMING`,
            ``,
            `@${sender}`,
            `  is about to clap @${target}...`,
            ``,
            `buckle up, bitch. 🍑💥`,
          ]),
          mentions: [m.sender, targetUser],
        },
        { quoted: m }
      );

      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1800));

      // ── result tiers ────────────────────────────────────────
      const tiers = [
        {
          icon: '😂',
          rank: 'F  —  DISASTER',
          bar:  '▓░░░░░░░░░',
          line: `@${target} laughed so hard they left the chat.`,
          verdict: `@${sender}, you fumbled HARD. Certified disaster.`,
        },
        {
          icon: '🔥',
          rank: 'B  —  STEAMY',
          bar:  '▓▓▓▓▓▓░░░░',
          line: `@${target} is flustered and won't look anyone in the eye.`,
          verdict: `@${sender}, not bad at all. Respectable heat. 🌡️`,
        },
        {
          icon: '💦🔥',
          rank: 'S  —  LEGENDARY',
          bar:  '▓▓▓▓▓▓▓▓▓▓',
          line: `@${target} has ascended. They're not the same anymore.`,
          verdict: `@${sender}, you broke physics. Absolute unit. 👑`,
        },
      ];

      const t = tiers[Math.floor(Math.random() * tiers.length)];

      const result =
        `╔══════════════════════════════╗\n` +
        `║  ${t.icon}  FUCK REPORT               ║\n` +
        `╠══════════════════════════════╣\n` +
        `║  RANK    ${t.rank.padEnd(20)}║\n` +
        `║  POWER   ${t.bar.padEnd(20)}║\n` +
        `╠══════════════════════════════╣\n` +
        `║  FROM  » @${sender.padEnd(19)}║\n` +
        `║  TO    » @${target.padEnd(19)}║\n` +
        `╠══════════════════════════════╣\n` +
        `║  ${t.line.slice(0, 28).padEnd(28)}║\n` +
        `╠══════════════════════════════╣\n` +
        `║  VERDICT                     ║\n` +
        `║  ${t.verdict.slice(0, 28).padEnd(28)}║\n` +
        `╠══════════════════════════════╣\n` +
        `║  ⚠️  fictional & consensual   ║\n` +
        `╚══════════════════════════════╝`;

      await client.sendMessage(
        m.chat,
        { text: result, mentions: [m.sender, targetUser] },
        { quoted: m }
      );

      // ── delete intro ────────────────────────────────────────
      if (introMsg?.key) {
        try { await client.sendMessage(m.chat, { delete: introMsg.key }); }
        catch (e) { console.error('Delete failed:', e.message); }
      }

    } catch (error) {
      console.error(`Fuck command error: ${error.stack}`);
      await m.reply(
        box([`💀  SYSTEM CRASH`, ``, `Something broke worse than`, `your game. Try again.`])
      );
    }
  },
};
