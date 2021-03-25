const Parser = require('rss-parser');
const fs = require('fs');
const https = require('https');
const helpers = require('./helpers');

const configPath = __dirname + '/config.json';

(async () => {
    const config = JSON.parse(fs.readFileSync(configPath));
    const discordSender = new helpers.DiscordSender(config.discordWebhookUrl);

    let lastId = '';
    do {
        const parser = new Parser();
        const feed = await parser.parseURL(config.feedUrl);
        
        for (let i = 0; i < feed.items.length; ++i){
            if (feed.items[i].guid === lastId || i === (feed.items.length - 1)) {
                for (let a = i; a > 0; --a) {
                    const item = feed.items[a];
                    
                    console.log(item.contentSnippet);
                    await helpers.sleep(2);
                    await discordSender.send(item.contentSnippet);
                };
                break;
            };
        };

        if (feed.items.length) {
            lastId = feed.items[0].guid;
        };
        
        console.log(`sleeping for ${config.sleepSeconds} seconds`);
    
    } while(await helpers.sleep(config.sleepSeconds))
    
})();
