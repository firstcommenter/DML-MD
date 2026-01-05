const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'del',
    aliases: ['delete', 'd'],
    description: 'Deletes the replied-to or quoted message with confirmation buttons',
    run: async (context) => {
        const { client, m, botname } = context;

        if (!botname) return m.reply('Bot error: No botname found in context.');

        try {
            // Validate message sender
            if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
                return m.reply('Cannot read your number!');
            }

            const userNumber = m.sender.split('@')[0];
            const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
            const isGroup = m.key.remoteJid.endsWith('@g.us');

            // Identify message to delete
            let deleteKey = null;
            let quotedSender = null;

            if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const contextInfo = m.message.extendedTextMessage.contextInfo;
                deleteKey = {
                    remoteJid: contextInfo.remoteJid || m.key.remoteJid,
                    fromMe: contextInfo.participant === botJid,
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                };
                quotedSender = contextInfo.participant;
            } else if (m.quoted && m.quoted.message) {
                deleteKey = {
                    remoteJid: m.quoted.key.remoteJid,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.key.id,
                    participant: m.quoted.key.participant || m.quoted.sender
                };
                quotedSender = m.quoted.sender;
            } else {
                return m.reply('Please reply to or quote a message to delete.');
            }

            // Send interactive confirmation message
            const confirmMsg = generateWAMessageFromContent(
                m.chat,
                {
                    interactiveMessage: {
                        body: { text: 'Do you really want to delete this message?' },
                        footer: { text: `Bot: ${botname}` },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: 'Confirm Delete',
                                        sections: [
                                            {
                                                rows: [
                                                    { title: '✅ Yes', description: 'Delete this message', id: `del_yes_${deleteKey.id}` },
                                                    { title: '❌ No', description: 'Cancel delete', id: `del_no_${deleteKey.id}` }
                                                ]
                                            }
                                        ]
                                    })
                                }
                            ]
                        }
                    }
                },
                { quoted: m }
            );

            await client.relayMessage(m.chat, confirmMsg.message, { messageId: confirmMsg.key.id });

            // Listen for button responses
            client.ev.on('messages.upsert', async (msgUpsert) => {
                const msg = msgUpsert.messages[0];
                if (!msg.message?.buttonsResponseMessage) return;
                const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;

                if (buttonId === `del_yes_${deleteKey.id}`) {
                    // Check admin if in group and message is not from bot
                    if (isGroup && !deleteKey.fromMe) {
                        const groupMetadata = await client.groupMetadata(m.key.remoteJid);
                        const groupAdmins = groupMetadata.participants
                            .filter(p => p.admin != null)
                            .map(p => p.id);
                        const isBotAdmin = groupAdmins.includes(botJid);
                        if (!isBotAdmin) {
                            return client.sendMessage(m.chat, {
                                text: `I am not an admin and cannot delete @${quotedSender.split('@')[0]}'s message.`,
                                mentions: [quotedSender]
                            });
                        }
                    }
                    // Delete the message
                    await client.sendMessage(m.chat, { delete: deleteKey });
                    await client.sendMessage(m.chat, { text: 'Message deleted successfully.' });
                } else if (buttonId === `del_no_${deleteKey.id}`) {
                    await client.sendMessage(m.chat, { text: 'Delete canceled.' });
                }
            });

        } catch (error) {
            console.error('Del command error:', error);
            await m.reply('Failed to delete the message. Please try again later.');
        }
    }
};
