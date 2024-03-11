const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT,
    ],
});

const processedMessages = new Set();
const sentMessages = new Set();

client.on('ready', () => {
    console.log(`${client.user.tag} is online. Waiting for command.`);

    scheduleMessages();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) {
        return;
    }

    if (message.content === 'hello' && !processedMessages.has(message.id)) {
        const embed = new MessageEmbed()
            .setTitle("Hello!")
            .setDescription("How are you?")
            .setColor("RANDOM");
        await message.reply({embeds:[embed]});
    } else if (
        message.content.toLowerCase().includes('who are you?') &&
        !processedMessages.has(message.id)
    ) {
        const embed = new MessageEmbed()
            .setTitle("Greetings!")
            .setDescription("I am **Server Bot**. I was made by Eugene S. Alonzo, a 4th-year BS Computer Science student of ISAT U, and Rodolfo T. Bolivar III, a 4th-year BS Computer Science student of CPU.")
            .setColor("RANDOM");
        await message.reply({embeds:[embed]});
        processedMessages.add(message.id);
    } else if (
        message.content.toLowerCase().includes('good morning') &&
        !processedMessages.has(message.id)
    ) {
        const embed = new MessageEmbed()
            .setTitle("Good Morning!")
            .setDescription("Today is a good day!")
            .setColor("RANDOM");
        await message.reply({embeds:[embed]});
        processedMessages.add(message.id);
    }
});

client.login('MTIxNDA0MTU5NjgyODU5MDEyMQ.GnPuGe.2CAfegL5OpV2CY9OHdY1_IAL2sr8uSnGN7HlRA');

function scheduleMessages() {
    setInterval(() => {
        const currentTime = new Date().toLocaleTimeString('en-US', {
            timeZone: 'Asia/Manila',
            hour12: false,
        });
        const date = new Date();
        const min = date.getMinutes();
        console.log(min);
        const channel = client.channels.cache.get('1215128157217234975'); 
        const scheduledMessages = [
            { time: '09:00', content: 'Good morning, everyone! \nHave a productive day ahead!' },
            { time: '10:30', content: 'Take a break, **you\'re not a robot!**' },
            { time: '12:00', content: 'REMINDER:\n**Don\'t forget to eat your lunch!**' },
            { time: '17:00', content: 'Goodbye everyone, be safe!' },
        ];

        //Test Code [Should send Inspirational Message every 30 minutes]
        if (min == "30" || min == "00") {
            sendRandomInspirationalQuote(channel);
            console.log("Quote sent successfully!")
        }

        if (isWeekday(new Date().getDay())) {
            scheduledMessages.push({ time: '22:00', content: 'Good night! Sleep tight.' });
        }

        let allMessagesSent = true; 

        for (const { time, content } of scheduledMessages) {
            if (isTimeWithinRange(currentTime, time, addMinutes(time, 1)) && !sentMessages.has(content)) {
                sendAsBot(channel, content);
                sentMessages.add(content);
                allMessagesSent = false; 
            }
        }

        // Clear sent messages only if all messages have been sent
        if (allMessagesSent && min == "00") {
            sentMessages.clear();
        }



        if (new Date().getDay() === 1) {
            if (isTimeWithinRange(currentTime, '09:00', '09:01') && !sentMessages.has('meeting')) {
                sendAsBot(channel, '**REMINDER:** \nGeneral meeting today! 📢');
                sendRandomInspirationalQuote(channel);
                sentMessages.add('meeting');
            }
        }

        if (new Date().getDay() === 5) {
            if (isTimeWithinRange(currentTime, '17:00', '17:01') && !sentMessages.has('weekender')) {
                sendWeekenderQuotes(channel);
                sentMessages.add('weekender');
            }
        }

        if (['1', '3', '5'].includes(new Date().getDay().toString()) && isTimeWithinRange(currentTime, '12:00', '12:01') && !sentMessages.has('inspirational')) {
            sendRandomInspirationalMessage(channel);
            sentMessages.add('inspirational');
        }

    }, 60000); // Check every minute
}

function isTimeWithinRange(currentTime, startTime, endTime) {
    const currentMinutes = convertTimeToMinutes(currentTime);
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function sendAsBot(channel, content) {
    if (channel) {
        const embed = new MessageEmbed()
            .setDescription(content)
            .setColor("RANDOM");

        channel.send({ embeds: [embed] })
            .then(() => console.log('Message sent successfully'))
            .catch(error => console.error('Error sending message:', error));
    }
}

function sendRandomInspirationalQuote(channel) {
    axios.get('https://api.quotable.io/random')
        .then((response) => {
            const quote = response.data.content;
            sendAsBot(channel, `**Inspirational Quote:**\n ${quote}`);
        })
        .catch((error) => {
            console.error('Error fetching inspirational quote:', error.message);
        });
}

function sendWeekenderQuotes(channel) {
    axios.get('https://api.quotable.io/quotes?tags=weekend')
        .then((response) => {
            const quotes = response.data.results;
            quotes.forEach((quote) => {
                sendAsBot(channel, `**Weekender Quote:**\n ${quote.content}`);
            });
        })
        .catch((error) => {
            console.error('Error fetching weekender quotes:', error.message);
        });
}

function sendRandomInspirationalMessage(channel) {
    axios.get('https://api.quotable.io/random')
        .then((response) => {
            const message = response.data.content;
            sendAsBot(channel, `**Inspirational Message:**\n ${message}`);
        })
        .catch((error) => {
            console.error('Error fetching inspirational message:', error.message);
        });
}

function addMinutes(time, minutes) {
    const [hours, originalMinutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + originalMinutes + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

function isWeekday(day) {
    // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    return day >= 1 && day <= 5;
}
