let config = require('../Config/config.json');
const {Rewriting, ActionRowBuilder, Events, logger, buffery, CreateButtons, CreateEmbedBuilder, PermissionsBitField, ChannelType  } = require("../index");

async function createTicket(guild, i, client) {
    try {
        let Buffery = buffery();
        return guild.channels.create({
            name: `Тикет-${Buffery}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [
                        PermissionsBitField['Flags'].ManageChannels,
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname,
                        PermissionsBitField['Flags'].SendTTSMessages,
                        PermissionsBitField['Flags'].SendMessagesInThreads,
                        PermissionsBitField['Flags'].UseApplicationCommands,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].MentionEveryone
                    ]
                },
                {
                    id: i.user.id,
                    allow: [
                        PermissionsBitField['Flags'].UseApplicationCommands,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].ViewChannel
                    ],
                    deny: [
                        PermissionsBitField['Flags'].ManageChannels,
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname,
                        PermissionsBitField['Flags'].SendTTSMessages,
                        PermissionsBitField['Flags'].SendMessagesInThreads,
                        PermissionsBitField['Flags'].MentionEveryone
                    ]
                },
                {
                    id: client.user.id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages
                    ]
                },
                {
                    id: guild.roles.cache.get(config.Community_Manager).id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ],
                    deny: [
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname
                    ]
                },
                {
                    id: guild.roles.cache.get(config.CEO).id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ],
                    deny: [
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname
                    ]
                },
                {
                    id: guild.roles.cache.get(config.Marketing_Specialist).id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ],
                    deny: [
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname
                    ]
                },
                {
                    id: guild.roles.cache.get(config.Curator).id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ],
                    deny: [
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname
                    ]
                },
                {
                    id: guild.roles.cache.get(config.HR_agent).id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ],
                    deny: [
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname
                    ]
                },
                {
                    id: guild.roles.cache.get(config.Junior_Curator).id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ],
                    deny: [
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname
                    ]
                },
                {
                    id: guild.roles.cache.get(config.Moderator).id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory
                    ],
                    deny: [
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ]
                },
                {
                    id: guild.roles.cache.get(config.Support).id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ],
                    deny: [
                        PermissionsBitField['Flags'].CreateInstantInvite,
                        PermissionsBitField['Flags'].ChangeNickname
                    ]
                },
            ],
            parent: config.id_category_ticket,
        }).then(new_channel => {
            i.reply({ content: `Ваш тикет создан, чтобы перейти в чат нажмите <#${new_channel.id}>`, ephemeral: true })
            config.count_ticket++;
            Rewriting(config);

            let mes = CreateEmbedBuilder();
            let but = CreateButtons();

            new_channel.send({ embeds: [mes.message_2], components: [new ActionRowBuilder().addComponents(but.button_2)] })
                .then(message => {
                    new_channel.send({ content: `${i.user}, напишите интересующий вас вопрос и дождитесь ответа от ${guild.roles.cache.get(config.Support).toString()}` }); //!ОТПРАВКА СООБЩЕНИЕ АДМИНАМ О СОЗДАНИИ НОВОГО ТИКЕТА!!!!
                });//! ОТПРАВКА БЛОКА О ЗАКРЫТИЕ ТИКЕТА!!!
        });
    } catch (error) {
        logger.error('Ошибка:' + error);
    }
}

module.exports = {createTicket}