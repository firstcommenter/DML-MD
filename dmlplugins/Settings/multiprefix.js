const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utils/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;

        const fmt = (title, lines) => {
            const body = lines.map(l => `║  ${l}`).join('\n');
            return `╔══〘 ${title} 〙══╗\n${body}\n╚══〘 *DML-MD* 〙══╝`;
        };

        try {
            const settings = await getSettings();
            const isEnabled = settings.multiprefix === 'true' || settings.multiprefix === true;
            const value = args[0]?.toLowerCase();

            if (value === 'on' || value === 'all') {
                if (isEnabled) return await client.sendMessage(m.chat, {
                    text: fmt('⚙️ MULTI-PREFIX', [
                        '✅ Already *enabled* — nothing changed.',
                        '🔣 All prefix symbols are active.',
                    ])
                }, { quoted: m });

                await updateSetting('multiprefix', 'true');
                await client.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });
                return await client.sendMessage(m.chat, {
                    text: fmt('⚙️ MULTI-PREFIX', [
                        '🔓 *Enabled successfully!*',
                        '🔣 Accepts » . ! # / $ ? + - * ~ @ %',
                        '💡 Null prefix also works.',
                    ])
                }, { quoted: m });
            }

            if (value === 'off') {
                if (!isEnabled) return await client.sendMessage(m.chat, {
                    text: fmt('⚙️ MULTI-PREFIX', [
                        '✅ Already *disabled* — nothing changed.',
                        `📌 Active prefix » *${settings.prefix || '.'}*`,
                    ])
                }, { quoted: m });

                await updateSetting('multiprefix', 'false');
                await client.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });
                return await client.sendMessage(m.chat, {
                    text: fmt('⚙️ MULTI-PREFIX', [
                        '🔒 *Disabled successfully!*',
                        `📌 Active prefix » *${settings.prefix || '.'}*`,
                    ])
                }, { quoted: m });
            }

            await client.sendMessage(m.chat, {
                text: fmt('⚙️ MULTI-PREFIX', [
                    `📊 Status  » *${isEnabled ? '🔓 ON' : '🔒 OFF'}*`,
                    `📌 Prefix  » *${settings.prefix || '.'}*`,
                    `📖 Usage   » *${prefix}multiprefix on/off*`,
                ]),
                buttons: [
                    { buttonId: `${prefix}multiprefix on`, buttonText: { displayText: '🔓 Enable' }, type: 1 },
                    { buttonId: `${prefix}multiprefix off`, buttonText: { displayText: '🔒 Disable' }, type: 1 },
                ],
                headerType: 1,
                viewOnce: true,
            }, { quoted: m });

        } catch (err) {
            await client.sendMessage(m.chat, {
                text: fmt('❌ ERROR', [
                    `💢 *${err.message}*`,
                ])
            }, { quoted: m });
        }
    });
};
