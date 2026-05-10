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
    return message.reply(
      'Use:\n`!pix chave valor`\n\nExemplo:\n`!pix email@gmail.com 10`'
    )
  }

  const valor = Number(valorTexto.replace(',', '.'))

  if (isNaN(valor)) {
    return message.reply('Valor inválido.')
  }

  // Detectar tipo da chave
  let tipoChave = 'Chave Aleatória'

  if (chave.includes('@')) {
    tipoChave = 'E-mail'
  }
  else if (/^\d{11}$/.test(chave)) {
    tipoChave = 'CPF'
  }
  else if (/^\d{14}$/.test(chave)) {
    tipoChave = 'CNPJ'
  }
  else if (/^\+55\d{10,11}$/.test(chave) || /^\d{10,11}$/.test(chave)) {
    tipoChave = 'Telefone'
  }

  // Gerar PIX
  const pix = QrCodePix({
    version: '01',
    key: chave,
    name: 'PixFast',
    city: 'SALVADOR',
    transactionId: 'PIXFAST',
    value: valor
  })

  const payload = pix.payload()

  // Gerar QRCode
  const qrBuffer = await QRCode.toBuffer(payload)

  const attachment = new AttachmentBuilder(qrBuffer, {
    name: 'pix.png'
  })

  // Embed bonita
  const embed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setAuthor({
      name: 'PixFast APP'
    })
    .setTitle('Chave PIX')
    .addFields(
      {
        name: 'Tipo:',
        value: `\`${tipoChave}\``,
        inline: false
      },
      {
        name: 'Valor:',
        value: `R$ ${valor.toLocaleString('pt-BR')}`,
        inline: false
      }
    )
    .setImage('attachment://pix.png')

  await message.channel.send({
    embeds: [embed],
    files: [attachment]
  })

})

client.login(TOKEN)