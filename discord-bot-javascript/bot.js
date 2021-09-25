// Starter Code: https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3#file-index_v12-js
const Discord = require("discord.js");
const speech = require('@google-cloud/speech');
const fs = require('fs');

/*
 DISCORD.JS VERSION 12 CODE
*/

const client = new Discord.Client();

const speechClient = new speech.SpeechClient(); // https://www.npmjs.com/package/@google-cloud/speech https://cloud.google.com/docs/authentication/getting-started

const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

/* 
{
  token: ... // From Discord Dev Portal
  prefix: ! 
}
*/

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("message", async message => {
  if(message.author.bot) return; // Ignore other bots
  if(!message.content.startsWith(config.prefix)) return; // Ignore messages not starting with our prefix
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
     
  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }

  if(command === "join") {

    message.reply("MIKA VI DEBA");
    if (!message.member.voice.channel) return message.reply('Please join a voice channel first!');
    if ((message.member.voice.channel.members.filter((e) => client.user.id === e.user.id).size > 0)) return message.reply(`I'm already in your voice channel!`);
    
    if (!message.member.voice.channel.joinable) return message.reply(`I don't have permission to join that voice channel!`);
    if (!message.member.voice.channel.speakable) return message.reply(`I don't have permission to speak in that voice channel!`);

    const connection = await message.member.voice.channel.join(); // https://discordjs.guide/voice/
    await connection.play('ding.wav');

    connection.on('speaking', (user, speaking) => { // https://discord.js.org/#/docs/main/stable/class/VoiceConnection?scrollTo=speaking
      if (!user) return; // If we don't know who is speaking
      if (user.bot) return; // Don't listen to other bots
      if (!speaking) return; // If for some reason they aren't actually speaking
      console.log("Someone speaking");
      const audio = connection.receiver.createStream(user, { mode: 'pcm' }); // Signed 16-bit PCM as the encoding, a Little-endian byte order, 2 Channels (Stereo) and a sample rate of 48000Hz. https://discordjs.guide/voice/receiving-audio.html#basic-usage

      const audioFileName = './recordings/' + user.id + '_' + Date.now() + '.pcm';

      console.log("try to create file");
      audio.pipe(fs.createWriteStream(audioFileName));
      console.log("created file");
      audio.on('end', async () => {
        
        console.log("End of speaking");
        fs.stat(audioFileName, async (err, stat) => { // For some reason, Discord.JS gives two audio files for one user speaking. Check if the file is empty before proceeding
          if (!err && stat.size) {
            const file = fs.readFileSync(audioFileName);
            console.log(file.byteLength);
            const audioBytes = file.toString('base64');
            const audio = {
              content: audioBytes,
            };
            const config = {
              encoding: 'LINEAR16',
              sampleRateHertz: 48000,
              languageCode: 'en-US',
              audioChannelCount: 2,
            };
            const request = {
              audio: audio,
              config: config,
            };
            //const [response] = await speechClient.recognize(request);
            /*const transcription = response.results
              .map(result => result.alternatives[0].transcript)
              .join('\n');*/
            message.channel.send(file.byteLength + ". ");
          }
        });
      });

    });
  }
  
});

client.login(config.token);
