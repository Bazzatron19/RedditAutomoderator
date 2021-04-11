const https = require('https');

const makeDiscordMessage = async function(item) {


    return new Promise((resolve) => {
        console.log(item.title.toString());
        var type = item.title.startsWith('/u/') ? 'Comment' : 'Post';
        const link = `[${item.title}](<${item.link}>)`;
        console.log(type);

        if(type == 'Post'){
            //gets content for message where link type posts
            if(item.content.toString().length != 0){
                //janky regex on html, pls no kill.
                //https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454
                var contentLink = item.content.match(/<span><a (?!<\/a>$)(.*?)(\[link\]<\/a>)/g).toString();
                var contentLinkTrimmed = contentLink.substring(15, contentLink.length - 12);
                console.log(contentLinkTrimmed);
            }

            if(item.link != contentLinkTrimmed){
                console.log('item.link != contentLinkTrimmed')
                //link post OR comment
                type = 'Link';
            }

        }

        console.log('Submission of type ' + type + ' detected');

        let message = type + ' - ' + link + '\n';
        message += item.isoDate.replace(/T|.000Z/g,' ').trim() + '\n' + '```';
        type.match('Link') ? message += 'Linked to: ' + contentLinkTrimmed + '\n' : message += 'Wrote the following: ' + '\n';
        message += item.contentSnippet.replace(/\[([link]+)\]|\[([comments]+)\]|  +/g,' ').trim().substring(0, (2000 - (message.length + 4)));
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
