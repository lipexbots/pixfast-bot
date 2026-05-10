const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  AttachmentBuilder
} = require('discord.js')

const QRCode = require('qrcode')
const { QrCodePix } = require('qrcode-pix')

const TOKEN = process.env.TOKEN

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.once('clientReady', () => {
  console.log(`Bot online: ${client.user.tag}`)
})

client.on('messageCreate', async message => {
  if (message.author.bot) return
  if (!message.content.startsWith('!pix')) return

  const args = message.content.split(' ')
  const chave = args[1]
  const valorTexto = args[2]

  if (!chave || !valorTexto) {
    return message.reply('Use assim: `!pix chave valor`\nExemplo: `!pix email@gmail.com 10`')
  }

  const valor = Number(valorTexto.replace(',', '.'))

  if (isNaN(valor)) {
    return message.reply('Valor inválido. Exemplo: `!pix email@gmail.com 10`')
  }

  let tipoChave = 'Chave Aleatória'

  if (chave.includes('@')) {
    tipoChave = 'E-mail'
  } else if (/^\d{11}$/.test(chave)) {
    tipoChave = 'CPF'
  } else if (/^\d{14}$/.test(chave)) {
    tipoChave = 'CNPJ'
  } else if (/^\+55\d{10,11}$/.test(chave) || /^\d{10,11}$/.test(chave)) {
    tipoChave = 'Celular'
  }

  const pix = QrCodePix({
    version: '01',
    key: chave,
    name: 'PixFast',
    city: 'SALVADOR',
    transactionId: 'PIXFAST',
    value: valor
  })

  const payload = pix.payload()

  const qrBuffer = await QRCode.toBuffer(payload, {
    width: 220,
    margin: 1
  })

  const attachment = new AttachmentBuilder(qrBuffer, {
    name: 'pix.png'
  })

  const valorFormatado = valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

  const embed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle('Chave PIX')
    .addFields(
      {
        name: 'Tipo:',
        value: `\`${tipoChave}\``,
        inline: true
      },
      {
        name: 'Valor:',
        value: `\`${valorFormatado}\``,
        inline: true
      }
    )
    .setImage('attachment://pix.png')

  await message.channel.send({
    embeds: [embed],
    files: [attachment]
  })
})

client.login(TOKEN)
