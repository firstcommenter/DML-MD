const fs = require('fs');

module.exports = async (context) => {
    const { client, m } = context;

    if (!m.isGroup) {
        return m.reply(
            '⚠️ *Group Only Command*\n\nThis command works in group chats only.'
        );
    }

    try {
        // Fetch fresh group metadata
        const gcdata = await client.groupMetadata(m.chat);

        // Generate VCF safely with only real WhatsApp numbers
        const vcard = gcdata.participants
            .filter(a => a && a.id && a.id.includes('@s.whatsapp.net')) // Only real numbers
            .map((a, i) => {
                let number = a.id.split('@')[0];
                number = number.replace(/\D/g, ''); // Keep digits only
                return `BEGIN:VCARD
VERSION:3.0
FN:[${i + 1}] +${number}
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
            '✅ *VCF Ready*\nYou can safely import this file to another account or email.'
        );

        // Send the VCF file
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

        // Cleanup temp file
        await fs.promises.unlink(tempFile);

    } catch (error) {
        console.error(`VCF error: ${error.message}`);
        await m.reply(
            '❌ *Error*\nFailed to generate VCF. Please try again later.'
        );
    }
};
