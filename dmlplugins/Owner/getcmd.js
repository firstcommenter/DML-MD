const fs = require('fs').promises;

module.exports = async (context) => {
    const { client, m, text, prefix } = context;

    try {
        // Restrict access to the bot owner only
        const allowedNumber = '255622220680@s.whatsapp.net';
        if (m.sender !== allowedNumber) {
            return await client.sendMessage(m.chat, {
                text: `❌ *Access denied!* This command is restricted to the bot owner only.\n> Powered by DML-TECH`
            }, { quoted: m });
        }

        if (!text) {
            return await client.sendMessage(m.chat, {
                text: `📄 *Please provide a command name!*\nExample: *${prefix}getcmd* or *${prefix}cmd ping*\n> Powered by DML-TECH`
            }, { quoted: m });
        }

        const categories = [
            { name: 'General' },
            { name: 'Settings' },
            { name: 'Owner' },
            { name: 'Heroku' },
            { name: 'Wa-Privacy' },
            { name: 'Groups' },
            { name: 'AI' },
            { name: '+18' },
            { name: 'Logo' },
            { name: 'Search' },
            { name: 'Coding' },
            { name: 'Media' },
            { name: 'Editing' },
            { name: 'Utils' }
        ];

        let fileFound = false;
        const commandName = text.endsWith('.js') ? text.slice(0, -3) : text;

        for (const category of categories) {
            const filePath = `./feecmd/${category.name}/${commandName}.js`;

            try {
                const data = await fs.readFile(filePath, 'utf8');

                // NEW FEATURE: show command category
                const replyText =
                    `✅ *Command Found!*\n\n` +
                    `📂 *Category:* ${category.name}\n` +
                    `📄 *File:* ${commandName}.js\n\n` +
                    `\`\`\`javascript\n${data}\n\`\`\`\n` +
                    `> Powered by DML-TECH`;

                await client.sendMessage(m.chat, { text: replyText }, { quoted: m });
                fileFound = true;
                break;
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    await client.sendMessage(m.chat, {
                        text: `⚠️ *Error reading command file:* ${err.message}\n> Powered by DML-TECH`
                    }, { quoted: m });
                    return;
                }
            }
        }

        if (!fileFound) {
            await client.sendMessage(m.chat, {
                text: `❌ *Command not found:* ${commandName}\nPlease try a valid command name.\n> Powered by DML-TECH`
            }, { quoted: m });
        }
    } catch (error) {
        console.error('Error in getcmd command:', error);
        await client.sendMessage(m.chat, {
            text: `⚠️ *Oops! Failed to process the command:* ${error.message}\nPowered by *DML-MD v3*`
        }, { quoted: m });
    }
};
