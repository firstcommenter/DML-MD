const fs = require('fs');

module.exports = async (context) => {
    const { client, m, participants } = context;

    if (!m.isGroup) {
        return m.reply(
            '⚠️ *Group Only Command*\n\nThis command works in group chats only.'
        );
    }

    try {
        const gcdata = await client.groupMetadata(m.chat);

        // Generate VCF for all participants
        const vcard = gcdata.participants
            .map((a, i) => {
                const number = a.id.split('@')[0];
                return `BEGIN:VCARD
VERSION:3.0
FN:[${i}] +${number}
TEL;type=CELL;type=VOICE;waid=${number}:+${number}
END:VCARD`;
            })
            .join('\n');

        const tempFile = './group_contacts.vcf';

        await m.reply(
            `📁 *Generating VCF...*\nCompiling *${gcdata.participants.length}* contacts from *${gcdata.subject}*`
        );

        await fs.promises.writeFile(tempFile, vcard);

        await m.reply(
            '✅ *VCF Ready*\nYou can import this file to another account or email safely without affecting your main contacts.'
        );

        // Send VCF file
        await client.sendMessage(
            m.chat,
            {
                document: fs.readFileSync(tempFile),
                mimetype: 'text/vcard',
                fileName: 'Group_Contacts.vcf',
                caption: `📇 *VCF Export for:* ${gcdata.subject}\n👥 *Total Contacts:* ${gcdata.participants.length}`
            },
            { ephemeralExpiration: 86400, quoted: m }
        );

        // Clean up
        await fs.promises.unlink(tempFile);

    } catch (error) {
        console.error(`VCF error: ${error.message}`);
        await m.reply(
            '❌ *Error*\nFailed to generate VCF. Please try again later.'
        );
    }
};
