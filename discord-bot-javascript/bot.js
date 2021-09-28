// Starter Code: https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3#file-index_v12-js
const Discord = require("discord.js");
const speech = require('@google-cloud/speech');
const fs = require('fs');

/**
 * promise-wrapped utility functions
 */

var readFile = path => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, file) => {
            if (err) {
                reject(err);
            } else {
                resolve(file);
            }
        });
    });
};

var writeFile = (path, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};


var readAudioBuffers = files => Promise.all(files.map(path => readFile(path)));

var concactenatePcm = async files => {
    const buffers = await readAudioBuffers(files);

    const totalBufferLength = buffers
        .map(buffer => buffer.length)
        .reduce((total, length) => total + length);

    return Buffer.concat(buffers, totalBufferLength);
};
/*
 DISCORD.JS VERSION 12 CODE
*/

const client = new Discord.Client();

const speechClient = new speech.SpeechClient(); // https://www.npmjs.com/package/@google-cloud/speech https://cloud.google.com/docs/authentication/getting-started

const config = require("./config.json");
const { default: axios } = require("axios");
// config.token contains the bot's token
// config.prefix contains the message prefix.

/* 
{
  token: ... // From Discord Dev Portal
  prefix: ! 
}
*/

let generateAudioFilename = (user) => {
    return './recordings/' + user.id + '_' + Date.now() + '.pcm';
}

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("message", async message => {
    if (message.author.bot) return; // Ignore other bots
    if (!message.content.startsWith(config.prefix)) return; // Ignore messages not starting with our prefix

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
    }

    if (command === "join") {

        if (!message.member.voice.channel) return message.reply('Please join a voice channel first!');
        if ((message.member.voice.channel.members.filter((e) => client.user.id === e.user.id).size > 0)) return message.reply(`I'm already in your voice channel!`);

        if (!message.member.voice.channel.joinable) return message.reply(`I don't have permission to join that voice channel!`);
        if (!message.member.voice.channel.speakable) return message.reply(`I don't have permission to speak in that voice channel!`);

        const connection = await message.member.voice.channel.join(); // https://discordjs.guide/voice/
        await connection.play('ding.wav');

        var audioBytesLength = 0
        var userBucket = {}

        connection.on('speaking', (user, speaking) => { // https://discord.js.org/#/docs/main/stable/class/VoiceConnection?scrollTo=speaking

            console.log(audioBytesLength)

            if (!user) return; // If we don't know who is speaking
            if (user.bot) return; // Don't listen to other bots
            if (!speaking) return; // If for some reason they aren't actually speaking

            const audio = connection.receiver.createStream(user, { mode: 'pcm' }); // Signed 16-bit PCM as the encoding, a Little-endian byte order, 2 Channels (Stereo) and a sample rate of 48000Hz. https://discordjs.guide/voice/receiving-audio.html#basic-usage

            var oldName = null;
            const audioFileName = audioBytesLength == 0 || oldName == null ? generateAudioFilename(user) : audioFileName;

            if (userBucket[user.id] === undefined) {
                userBucket[user.id] = []
            }

            userBucket[user.id].push(audioFileName);

            //console.log("null ? " + JSON.stringify(userBucket))
            audio.pipe(fs.createWriteStream(audioFileName, { flags: 'a' }));

            audio.on('end', async () => {

                console.log("End of speaking");
                fs.stat(audioFileName, async (err, stat) => { // For some reason, Discord.JS gives two audio files for one user speaking. Check if the file is empty before proceeding
                    if (!err && stat.size) {
                        const file = fs.readFileSync(audioFileName);
                        audioBytesLength += file.byteLength;

                        if (audioBytesLength <= 800000) {
                            return;
                        }

                        audioBytesLength = 0
                        oldName = audioFileName


                        //console.log(userBucket[user.id])

                        let res = await concactenatePcm(userBucket[user.id])
                        userBucket[user.id] = []

                        writeFile('final_sending.pcm', res).then(async (res) => {

                            const file = fs.readFileSync("final_sending.pcm");
                            var audioBytes = file.toString("base64");

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

                            const [response] = await speechClient.recognize(request);
                            const transcription = response.results
                                .map(result => result.alternatives[0].transcript)
                                .join('\n');

                            console.log(transcription)
                            axios.post('http://10.15.3.0:5000/recommendation', transcription)
                                .then(res => {
                                    if (res.data === "listening") console.log("listening")
                                    if (res.data !== "" && res.data !== "listening" && res.data !== undefined) {
                                        const embed = new Discord.MessageEmbed()
                                        .setTitle(`Hey ${user.username}, Argus found this solution to a similar problem you mentioned!`)
                                        .setAuthor(res.data.title, "https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=612x612&w=0&h=lGpj2vWAI3WUT1JeJWm1PRoHT3V15_1pdcTn2szdwQ0=")
                                        /*
                                        * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
                                        */
                                       .setColor(0x00AE86)
                                       .setDescription(res.data.description)
                                       .setFooter("Traversing your knowledge network!", "https://cdn.icon-icons.com/icons2/2249/PNG/512/eye_check_outline_icon_139629.png")
                                       .setImage(res.data.image)
                                       /*
                                       * Takes a Date object, defaults to current date.
                                       */
                                      .setTimestamp()
                                      .setURL(res.data.url)
                                     
                                     message.channel.send({ embed });
                                    }
                                    }).catch(err => {
                                    console.log(err)
                                });
                        })
                    }
                });
            });

        });
    }

});

client.login(config.token);
