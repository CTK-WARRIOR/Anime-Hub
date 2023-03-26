const http = require('http');
let Anime = require("ctk-anime-scraper")
Anime = new Anime.Gogoanime({ base_url: "https://gogoanime.gr/" })
const express = require('express');
const { mainURL  , quality } = require("./config.js")
const app = express();
const fetch = require("node-fetch")
const server = http.createServer(app);
let videoURL;
let proxyURL;

const https = require('https');

function proxyUrl(url) { // Added Cors
  const proxy = "https://cors-ghoul.herokuapp.com"
  const proxyUrl = new URL(url);
  proxyUrl.protocol = 'https:';
  proxyUrl.host = proxy;
  const options = {
    method: 'GET',
    headers: {
      Host: proxyUrl.hostname
    },
    rejectUnauthorized: false // disable SSL/TLS verification
  };
  return new Promise((resolve, reject) => {
    const request = https.request(proxyUrl, options, (response) => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        resolve(response.headers.location);
      } else {
        reject(new Error(`Proxy request failed: ${response.statusCode} ${response.statusMessage}`));
      }
    });
    request.end();
  });
}


app.set('view engine', 'ejs');
app.use(express.static("public"));

let cache = {
  recentAnime: []
}

Anime.getRecentAnime().then(data => {
  cache.recentAnime = data;
}).catch(err => { })

require("./cache/recentAnime.js")(cache, Anime)

app.get('/', async (req, res) => {
  let data = cache.recentAnime
  res.render('index', { data: cache.recentAnime, url: mainURL });
});

app.get('/watch', async (req, res) => {
 const proxy = require("./config.js")
  let string = req.query.data
  let decoded = atob(string)
  let parts = decoded.split("/");
  let anime_id = parts[parts.length - 1];

  let api = `https://api.consumet.org/anime/gogoanime/watch/${anime_id}?server=vidstreaming`

  fetch(api)
  .then((response) => response.json())
  .then((animelist) => {
    
 let video  = animelist.sources.find(source => source.quality === quality);

  if (video) {
 videoUrl = video.url;
}

res.render('watch', {
      videoUrl: videoUrl,
      ProxyURL: proxy
});

  });

  if (!string) return res.end("Invalid link!")

});

app.get("/anime", async (request, response) => {
  let search = request.query.search;
  if (!search) return response.end("its dead end :/")
  let data;
  let animeData;
  let slug;
  try {
    animeData = await Anime.search(search);
    if (!animeData.length) return response.end("its dead end :/");
    slug = animeData[0].link
    animeData = await Anime.fetchAnime(animeData[0].link, { disableEpisodeFetch: true })

    data = await fetch("https://kitsu.io/api/edge/anime?filter[text]=" + animeData.name, {
      method: "GET",
      headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' }
    })
    data = await data.json()
  } catch {
    response.end("its dead end :/");
  }

  slug = slug.split("/")
  slug = slug[slug.length - 1]

  response.render('anime', { anime: data.data[0], data: animeData, slug: slug, url: mainURL })

})

app.get("/search", async (req, res) => {
  let search = req.query.text;
  if (!search) return res.end("its dead end :/");
  let data = await Anime.search(search).catch(err => {
    data = []
  })

  res.render("search", { data, search, mainURL })
})

app.get("/download", async (req, res) => {
  let string = req.query.data
  if (!string) return res.end("Invalid link!")
  try {
    let buff = new Buffer.from(string, 'base64');
    let text = buff.toString('ascii');
    let link = await Anime.getFromLink(text)

    res.redirect(link.download[link.download.length - 1].link)
  } catch {
    return res.end("Invalid link!")
  }
})


const listener = server.listen(process.env.PORT, function() {
  console.log(`Your app is listening on port ` + listener.address().port);
});

