const Parser = require('rss-parser');


// TODO: parse config.json for all state variables


(async () => {

    // keep track of the most recent id identified in the queue
    let lastId = '';

    // iterate trhough all feed urls
        
    const parser = new Parser();
    const feed = await parser.parseURL(feedUrl);

    // iterate through feed items
    for (let i = feed.items.length; i > 0; --i) {
        const item = i-1;
        console.log(JSON.stringify(feed.items[item].contentSnippet));
    }

})();
