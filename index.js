const Parser = require('rss-parser');
const fs = require('fs');
const helpers = require('./helpers');

const configPath = __dirname + '/config.json';

//TODO - add error handling for RSS feed not being available.
(async () => {
    const config = JSON.parse(fs.readFileSync(configPath));
    const discordSender = new helpers.DiscordSender(config.discordWebhookUrl);

    /**
     * Reddit RSS feed is odd... RSS feeds SHOULD be ordered chronologically.
     * The timestamp in the feed is actually an UPDATED value rather then the
     * time of inception.
     * Unless we keep track of posts, we are unable to filter newly updated items
     * therefore we could get dupes
     * ----
     * We will need to collect all timestamps for sorting, and update 
     * "latestTimestamp" wtih the modst recent time.
     * ----
     * rss-parser will return items in order of feed; this is not a rss-parser
     * issue.
     */

    do {
        const parser = new Parser();
        const feed = await parser.parseURL(config.feedUrl);
        const timeStamps = []

        for (let i = feed.items.length; i > 0; --i){

            const item = feed.items[i-1];
            const itemTimestamp = Date.parse(item.isoDate);
            if (itemTimestamp > config.latestTimestamp) {
                timeStamps.push(itemTimestamp);
                await helpers.sleep(2); // sleep between discord posts for rate limits
                await discordSender.send(await helpers.makeDiscordMessage(item));
            };

        };

        if (timeStamps.length) {
            const latestTimestamp = timeStamps.sort().reverse()[0];
            // update config
            if (latestTimestamp !== config.latestTimestamp) {
                config.latestTimestamp = latestTimestamp;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            };
        };

        // console.log(`sleeping for ${config.sleepSeconds} seconds`);

    } while(await helpers.sleep(config.sleepSeconds));
    
})();
