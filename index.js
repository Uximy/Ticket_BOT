const fs = require('fs');
const { Client, GatewayIntentBits, PermissionsBitField, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages] });
let config = require('./Config/config.json');
const pino = require('pino');
let version = "0.1.8";

const transport = pino.transport({
    targets: [
        {
            target: 'pino-pretty',
            options: {
                destination: './logs/logs.log',
                mkdir: true,
                colorize: false,
                translateTime: 'UTC:dd-mm-yyyy HH:MM:ss'
            }
        },
        {
            target: 'pino-pretty',
            options: {
                destination: process.stdout.fd,
                tanslateTime: 'UTC:dd-mm-yyyy HH:MM:ss'
            }
        }
    ]
})

const logger = pino({
    level: 'info'
}, transport);


var connectModules = function (dir = './modules', files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            connectModules(name, files_);
        } else {
            files_.push(name);
        }
    }
    var modules = [];
    for (let i = 0; i < files_.length; i++) {
        modules.push(require(files_[i]));
    }
    return modules;
};

function CreateEmbedBuilder() {
    const message_1 = new EmbedBuilder()
        .setColor('#FA747D')
        .setTitle('Тикеты')
        .setAuthor({ name: 'Поддержка' })
        .setTitle('Создайте тикет для связи с администрацией')
        .setDescription('Нажмите на кнопку, для создания тикета')


    const message_2 = new EmbedBuilder()
        .setColor('#FA747D')
        .setTitle('Тикеты')
        .setAuthor({ name: 'Поддержка' })
        .setTitle('Закрыть тикет')
        .setDescription('Нажмите на кнопку, чтобы закрыть тикет')
        .setFooter({ text: 'Когда ваш вопрос будет решен, пожалуйста, самостоятельно закройте тикет' })

    return { message_1, message_2 };
}

function CreateButtons() {
    const button_1 = new ButtonBuilder()
        .setCustomId('createticket')
        .setLabel('Создать тикет')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛠️')


    const button_2 = new ButtonBuilder()
        .setCustomId('closeticket')
        .setLabel('Закрыть тикет')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔐')

    return { button_1, button_2 };
}

function create_blockInfo_ticket(id_channel) {
        try {
            const channel = client.channels.cache.get(id_channel);
            
            let messages = CreateEmbedBuilder();
            let buttons = CreateButtons();
            channel.messages.fetch(config.last_id_message_create_ticket).catch((err) => {
                if (err.code == "10008") {
                    const message_createTicket = channel.send({embeds: [messages.message_1], components: [new ActionRowBuilder().addComponents(buttons.button_1)]}); //!отправлять сообщение в чат
                
                    message_createTicket.then((result) => {
                        config.last_id_message_create_ticket = result.id;
                        Rewriting(config);
                    });
                }
            });
        } catch (error) {
            logger.error('Ошибка:' + error);
        }
}

client.on('ready', async () => {
    try {
        logger.info(`Bot logged in as ${client.user.tag}!`);

        create_blockInfo_ticket(config.channel_ticket_id);

        client.user.setPresence({
            activities: [{
                name: `Играет на SDK | version ${version}`,
                type: ActivityType.Custom
            }], status: 'dnd'
        });
    } catch (error) {
        logger.error(error);
    }
});

function Rewriting(newJson, fileName = 'config') {
    fs.writeFileSync(`./Config/${fileName}.json`, JSON.stringify(newJson, null, " "), "utf8");
}

function buffery(old_count) {
    let Buffery = 0;
    if (old_count == null) {
        Buffery = config.count_ticket;
    } else {
        Buffery = old_count;
    }
    while (Buffery.toString().length < 4) {
        Buffery = '0' + Buffery;
    }
    return Buffery;
}



client.on(Events.InteractionCreate, (i) => {
    if (!i.isButton()) return;
    if (i.customId === 'createticket') {
        try {
            const guild = client.guilds.cache.get(config.Guild_id);
            if (i.member.roles.cache.some(role => role.name === 'Muted')) {
                i.reply({ content: `У вас присутствует роль ${guild.roles.cache.find(muted => muted.name === "Muted").toString()}, вы не можете создавать тикеты.`, ephemeral: true });
            } else {
                connectModules()[1].createTicket(guild, i, client); //@f ВЫПОЛНЕНИЕ ФУНКЦИИ ОТКРЫТИЕ ТИКЕТА
            }
        } catch (error) {
            logger.error('Ошибка:' + error);
        }
    }
});

client.on(Events.InteractionCreate, (i_new) => {
    if (!i_new.isButton()) return;
    if (i_new.customId == 'closeticket') {
        try {
            const guild = client.guilds.cache.get(config.Guild_id);
            if (i_new.member.roles.cache.some(role => role.name === 'Moderator') && !i_new.member.roles.cache.some(role => role.name === 'Support')) {
                i_new.reply({ content: `У вас присутствует роль ${guild.roles.cache.find(muted => muted.name === "Moderator").toString()}, вы не можете закрывать тикет.`, ephemeral: true });
            } else {
                connectModules()[0].closeTicket(guild, i_new, client); //@f ВЫПОЛНЕНИЕ ФУНКЦИИ ЗАКРЫТИЕ ТИКЕТА
            }
        } catch (error) {
            logger.error('Ошибка:' + error);
        }
    }
});

client.login(config.Token);

module.exports = { Rewriting, ActionRowBuilder, Events, logger, buffery, CreateButtons, CreateEmbedBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType }