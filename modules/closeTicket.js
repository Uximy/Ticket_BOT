let config = require('../Config/config.json');
const { logger, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("../ticket");
const archiveFiles = require('../archiveFiles.js');


async function closeTicket(guild, i_new, client) {
    try {
        const channel = guild.channels.cache.get(i_new.message.channelId);
        channel.edit({
            name: `Закрыт-${channel.name.split('-')[1]}`,
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
                    id: client.user.id,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory,
                        PermissionsBitField['Flags'].SendMessages
                    ]
                },
                {
                    id: config.Community_Manager,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory
                    ],
                    deny: [
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ]
                },
                {
                    id: config.CEO,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory
                    ],
                    deny: [
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ]
                },
                {
                    id: config.Marketing_Specialist,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory
                    ],
                    deny: [
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ]
                },
                {
                    id: config.Curator,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory
                    ],
                    deny: [
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ]
                },
                {
                    id: config.Support,
                    allow: [
                        PermissionsBitField['Flags'].ViewChannel,
                        PermissionsBitField['Flags'].ReadMessageHistory
                    ],
                    deny: [
                        PermissionsBitField['Flags'].SendMessages,
                        PermissionsBitField['Flags'].MentionEveryone
                    ]
                }
            ],
            parent: client.channels.cache.find(ct => ct.name.startsWith(config.name_category_close_ticket)),
        })
            .catch((err) => {
                if (err.code === 50035 && err.message.includes('Maximum number of channels in category reached')) {
                    const channel_archive = client.channels.cache.find(ct => ct.name.startsWith(config.name_category_close_ticket));

                    const channels = channel_archive.guild.channels.cache.filter(channel => channel.parentId === channel_archive.id);
                    const firstChannel = channels.first();

                    async function getUsersDiscord(userId) {
                        const axios = require('axios');
                    
                        try {
                            const res = await axios.get(`https://discord.com/api/v9/users/${userId}`, {
                                headers: {
                                    Authorization: `Bot ${config.Token}`
                                }
                            });
                    
                            return res.data;
                        } catch (error) {
                            if (error.response.status === 404) {
                                throw new Error(error.response.status);
                            } else {
                                logger.error('Ошибка: ' + error)
                                throw error;
                            }
                        }
                    }

                    if (firstChannel) {
                        const promises = [];
                        promises.push(firstChannel.messages.fetch({ limit: 100 })
                            .then(async messages => {
                                // console.log(`Получил ${messages.size} сообщений`);
                                const users = [];
                                const messageCounts = {};
                                const userMentionRegex = /<@(\d+)>/g;
                                const roleMentionRegex = /<@&(\d+)>/g;
                                const channelMentionRegex = /<#(\d+)>/g;

                                // Создаем массив промисов для обработки упоминаний пользователей
                                const userPromises = messages.map(async message => {
                                    // console.log(message.embeds[0].data);
                                    const userId = message.author.id;
                                    messageCounts[userId] = (messageCounts[userId] || 0) + 1;

                                    let content = message.content;
                                    const matches = [...message.content.matchAll(userMentionRegex)]; // Конвертируем итератор матчей в массив

                                    const userReplacements = [];
                                    for (const match of matches) {
                                        const userId = match[1]; // Извлекаем идентификатор пользователя из регулярного выражения
                                        try {
                                            const user = await message.guild.members.fetch(userId);
                                            const noUser = await getUsersDiscord(userId);
                                            userReplacements.push(user ? `<span class="tags">@${user.user.globalName == null ? user.user.username : user.user.globalName}</span>` : noUser != '404' ? noUser.global_name : `<span class="tags">@Unknown User</span>`);
                                        } catch (error) {
                                            logger.error('Ошибка: ' + error);
                                            userReplacements.push(`<span class="tags">@Unknown User</span>`);
                                        }
                                    }

                                    // Заменяем упоминания пользователей в сообщении
                                    matches.forEach((match, index) => {
                                        content = content.replace(match[0], userReplacements[index]);
                                    });

                                    //обработчик упоменинания ролей
                                    content = content.replace(roleMentionRegex, (match, roleId) => {
                                        const role = message.guild.roles.cache.get(roleId);
                                        return `<span class="tags">@${role ? role.name : "Unknown Role"}</span>`;
                                    });

                                    //обработчик упоменинания каналов
                                    content = content.replace(channelMentionRegex, (match, channelId) => {
                                        const channel = message.guild.channels.cache.get(channelId);
                                        return `<span class="tags">#${channel ? channel.name : "Unknown Channel"}</span>`;
                                    });

                                    return {
                                        "message": message,
                                        "content": content
                                    };
                                });

                                // Дожидаемся завершения всех промисов
                                const processedMessages = await Promise.all(userPromises);

                                // Сортируем обработанные сообщения по времени создания
                                processedMessages.sort((a, b) => a.message.createdTimestamp - b.message.createdTimestamp);

                                // Создаем список пользователей для последующей обработки
                                const usersList = [];

                                // Обрабатываем сообщения в правильном порядке и добавляем данные пользователей в usersList
                                processedMessages.forEach(async processedMessage => {
                                    const message = processedMessage.message;
                                    const content = processedMessage.content;

                                    const author = message.author;
                                    const userId = author.id;

                                    if (!usersList.some(user => user.id === userId)) {
                                        usersList.push({
                                            "id": userId,
                                            "discriminator": author.discriminator == "0" ? "#0000" : "#" + author.discriminator,
                                            "avatarURL": author.avatarURL(),
                                            "NickName": author.username ? author.username : author.globalName,
                                            "createdAccount": author.createdAt,
                                            "bot": author.bot ? true : false,
                                            "messageCount": 0
                                        });
                                    }

                                    const userIndex = usersList.findIndex(user => user.id === userId);
                                    usersList[userIndex].messageCount++;
                                    const noUser = await getUsersDiscord(userId);
                                    users.push({
                                        "id": userId,
                                        "discriminator": usersList[userIndex].discriminator,
                                        "avatarURL": usersList[userIndex].avatarURL != null ? usersList[userIndex].avatarURL : noUser != 404 ? `https://cdn.discordapp.com/avatars/${userId}/${noUser.avatar}.png` : 'https://amazinghiring.com/wp-content/uploads/2021/07/discord-banner.png',
                                        "NickName": usersList[userIndex].NickName,
                                        "createdAccount": usersList[userIndex].createdAccount,
                                        "bot": usersList[userIndex].bot,
                                        "messageCount": usersList[userIndex].messageCount != undefined ? usersList[userIndex].messageCount : 0,
                                        "messageCreateTime": message.createdTimestamp,
                                        "content": content,
                                        "embeds": message.embeds[0] ? message.embeds[0].data.type != 'link' && message.embeds[0].data.type != 'article' && message.embeds[0].data.type != 'video' && message.embeds[0].data.type != 'image' && message.embeds[0].data.type != 'gifv' ? message.embeds[0].data : false : false
                                    });
                                });


                                users.forEach(user => {
                                    const userId = user.avatarURL.split("/")[4];
                                    user.messageCount = messageCounts[userId];
                                });

                                return users;
                            }));

                        Promise.all(promises)
                            .then(async results => {
                                let Users = results.flat();
                                let writeFile = await archiveFiles(Users, firstChannel);
                                if (writeFile.status == 'ok') {
                                    let button_url = new ButtonBuilder()
                                        .setLabel('Перейти в тикет')
                                        .setURL(writeFile.url)
                                        .setStyle(ButtonStyle.Link)
                                    const channel_files = client.channels.cache.get(config.channelArchivesFilesID);
                                    channel_files.send({ content: `Архив по тикету-${firstChannel.name.split('-')[1]} создан`, components: [new ActionRowBuilder().addComponents(button_url)] }).then(() => {
                                        firstChannel.delete().then(() => {
                                            channel.edit({
                                                name: `Закрыт-${channel.name.split('-')[1]}`,
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
                                                        id: client.user.id,
                                                        allow: [
                                                            PermissionsBitField['Flags'].ViewChannel,
                                                            PermissionsBitField['Flags'].ReadMessageHistory,
                                                            PermissionsBitField['Flags'].SendMessages
                                                        ]
                                                    },
                                                    {
                                                        id: config.Community_Manager,
                                                        allow: [
                                                            PermissionsBitField['Flags'].ViewChannel,
                                                            PermissionsBitField['Flags'].ReadMessageHistory
                                                        ],
                                                        deny: [
                                                            PermissionsBitField['Flags'].SendMessages,
                                                            PermissionsBitField['Flags'].MentionEveryone
                                                        ]
                                                    },
                                                    {
                                                        id: config.CEO,
                                                        allow: [
                                                            PermissionsBitField['Flags'].ViewChannel,
                                                            PermissionsBitField['Flags'].ReadMessageHistory
                                                        ],
                                                        deny: [
                                                            PermissionsBitField['Flags'].SendMessages,
                                                            PermissionsBitField['Flags'].MentionEveryone
                                                        ]
                                                    },
                                                    {
                                                        id: config.Marketing_Specialist,
                                                        allow: [
                                                            PermissionsBitField['Flags'].ViewChannel,
                                                            PermissionsBitField['Flags'].ReadMessageHistory
                                                        ],
                                                        deny: [
                                                            PermissionsBitField['Flags'].SendMessages,
                                                            PermissionsBitField['Flags'].MentionEveryone
                                                        ]
                                                    },
                                                    {
                                                        id: config.Curator,
                                                        allow: [
                                                            PermissionsBitField['Flags'].ViewChannel,
                                                            PermissionsBitField['Flags'].ReadMessageHistory
                                                        ],
                                                        deny: [
                                                            PermissionsBitField['Flags'].SendMessages,
                                                            PermissionsBitField['Flags'].MentionEveryone
                                                        ]
                                                    },
                                                    {
                                                        id: config.Support,
                                                        allow: [
                                                            PermissionsBitField['Flags'].ViewChannel,
                                                            PermissionsBitField['Flags'].ReadMessageHistory
                                                        ],
                                                        deny: [
                                                            PermissionsBitField['Flags'].SendMessages,
                                                            PermissionsBitField['Flags'].MentionEveryone
                                                        ]
                                                    }
                                                ],
                                                parent: client.channels.cache.find(ct => ct.name.startsWith(config.name_category_close_ticket)),
                                            })
                                        })
                                    })

                                } else if (writeFile.status == 'error') logger.error(writeFile.errorMessage)
                            })
                            .catch(err => {
                                logger.error(err);
                            });

                    } else {
                        console.log('В этой категории нет каналов');
                    }
                }
            })
        i_new.reply({ content: `${i_new.user} закрыл тикет с номером #${channel.name.split('-')[1]}` });
        i_new.message.delete();
    } catch (error) {
        logger.error('Ошибка:' + error);
    }
}

module.exports = { closeTicket };