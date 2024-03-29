const Axios = require("axios");

let showingOff = [];
let urgentHelp = [];
let careAdvice = [];
let artsAndCrafts = [];
let discussion = [];

let lastUpdated = 0;

function isAllowedToUpdate() {
    return Date.now() > lastUpdated + 60 * 30 * 1000; // Update once every 30 minutes
}

async function update() {
    lastUpdated = Date.now();

    const limit = 100;
    const res = await Axios.get(`https://www.reddit.com/r/axolotls/new.json?limit=${limit}`);
    
    showingOff = [];
    urgentHelp = [];
    careAdvice = [];
    artsAndCrafts = [];
    discussion = [];

    for (const child of res.data.data.children) {
        const { title, score, author, total_awards_received } = child.data;
        
        const link = "https://www.reddit.com" + child.data.permalink;

        let media = child.data.media_metadata;
        if (media) media = Object.values(media).map((media_item) => media_item.s.u.split("?")[0].replace("preview.redd.it", "i.redd.it"));
        else if (child.data.url) media = [child.data.url];

        let payload = { title, score, media, link, author, total_awards_received };
        payload.comments = child.data.num_comments;

        switch(child.data.link_flair_text) {
            case "Just Showing Off 😍": showingOff.push(payload); break;
            case "Urgent Help": urgentHelp.push(payload); break;
            case "General Care Advice": careAdvice.push(payload); break;
            case "Arts and Crafts": artsAndCrafts.push(payload); break;
            case "Discussion": discussion.push(payload); break;

            default: console.log("Unhandled flair: " + child.data.link_flair_text); break;
        }
    }

    const handledLength = showingOff.length + urgentHelp.length + careAdvice.length + artsAndCrafts.length + discussion.length;
    console.log(`Handled ${handledLength} out of ${limit} posts!`);
}

module.exports = async ({ router }) => {
    await update();

    router.get("/showing-off", (req, res) => {
        if (showingOff.length == 0) { update(); return res.sendStatus(503); }
        res.send(showingOff[Math.floor(Math.random() * showingOff.length)]);
        if (isAllowedToUpdate()) { update(); }
    });

    router.get("/urgent-help", (req, res) => {
        if (urgentHelp.length == 0) { update(); return res.sendStatus(503); }
        res.send(urgentHelp[Math.floor(Math.random() * urgentHelp.length)]);
        if (isAllowedToUpdate()) { update(); }
    });

    router.get("/care-advice", (req, res) => {
        if (careAdvice.length == 0) { update(); return res.sendStatus(503); }
        res.send(careAdvice[Math.floor(Math.random() * careAdvice.length)]);
        if (isAllowedToUpdate()) { update(); }
    });

    router.get("/arts-and-crafts", (req, res) => {
        if (artsAndCrafts.length == 0) { update(); return res.sendStatus(503); }
        res.send(artsAndCrafts[Math.floor(Math.random() * artsAndCrafts.length)]);
        if (isAllowedToUpdate()) { update(); }
    });

    router.get("/discussion", (req, res) => {
        if (discussion.length == 0) { update(); return res.sendStatus(503); }
        res.send(discussion[Math.floor(Math.random() * discussion.length)]);
        if (isAllowedToUpdate()) { update(); }
    });
}