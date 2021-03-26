const Parser = require('rss-parser');
const fs = require('fs');
const helpers = require('./helpers');

const configPath = __dirname + '/config.json';

(async () => {
    const config = JSON.parse(fs.readFileSync(configPath));
    const discordSender = new helpers.DiscordSender(config.discordWebhookUrl);

    let lastId = '';
    do {
        const parser = new Parser();
        const feed = await parser.parseURL(config.feedUrl);
        
        for (let i = -1; i < feed.items.length; ++i){
            if (feed.items[i].guid === lastId || i === (feed.items.length - 1)) {
                for (let a = i; a > 0; --a) {
                    const item = feed.items[a];
                    await helpers.sleep(2); // sleep between discord posts incase of rate limits
                    await discordSender.send(await helpers.makeDiscordMessage(item));
                };
                break;
            };
        };

        if (feed.items.length) {
            lastId = feed.items[0].guid;
        };
        
        console.log(`sleeping for ${config.sleepSeconds} seconds`);
    
    } while(await helpers.sleep(config.sleepSeconds));
    
})();
