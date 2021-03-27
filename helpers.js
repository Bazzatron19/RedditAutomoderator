const https = require('https');

const makeDiscordMessage = async function(item) {
    return new Promise((resolve, reject) => {
        const type = item.title.startsWith('/u/') ? 'Comment' : 'Post';
        const link = `[${item.title}](<${item.link}>)`;

        let message = type + ' - ' + link + '\n' + '```';
        message += item.contentSnippet.substring(0, (2000 - (message.length + 4)));
        message += '```-';

        resolve(message);
    });
};

const sleep =  async function(seconds) {
    return new Promise((resolve) => {
        setTimeout(
            () => { resolve(true) },
            seconds*1000
        );
    });
};

class DiscordSender {
    constructor(discordWebhookUrl) {
        this.url = new URL(discordWebhookUrl)
        this.options = {
            hostname: this.url.hostname,
            path: this.url.pathname,
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
    };

    async send(message) {
        return new Promise((resolve, reject) => {

            const req = https.request(
                this.options, (res) => {
                    
                    const chunks = [ ];

                    res.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
                    
                    res.on('error', (err) => {
                        reject(`Discord response callout error: ${err}`);
                    });
                    
                    res.on('end', () => {
                        console.log(`statuscode: ${res.statusCode}`)
                        if (res.statusCode > 200 && res.statusCode >= 300) {
                            reject(`Discord callout statuscode: ${res.statuscode}. body: ${Buffer.concat(chunks).toString()}`);
                        } else {
                            resolve('Discord message sent');
                        };
                    });
                }
            );
            req.on('error', (err) => {
                reject(`Discord request callout error: ${err}`);
            });
            req.write(JSON.stringify({content: message.substring(0, 2000)}));
            req.end();
        });
    };
};


// exports
exports.sleep = sleep;
exports.makeDiscordMessage = makeDiscordMessage;
exports.DiscordSender = DiscordSender;
