const http = require('http');
const Anime = require("ctk-anime-scraper")
const express = require('express');
const { mainURL } = require("./config.json")
const app = express();
const fetch = require("node-fetch")
const server = http.createServer(app);
app.set('view engine', 'ejs');
app.use(express.static("public"));

let cache = {
  recentAnime: []
}

Anime.getRecentAnime().then(data => {
  cache.recentAnime = data;
}).catch(err => {})

require("./cache/recentAnime.js")(cache)

app.get('/', async (req, res) => {
  let data = await Anime.getRecentAnime().catch(err => {
    data = []
  })
  res.render('index', { data: cache.recentAnime, url: mainURL });
});

app.get('/watch', async (req, res) => {
	
   let string = req.query.data
  if (!string) return res.end("Invalid link!")
  let vdo;
  let name;
  try {
  let buff = new Buffer.from(string, 'base64');
  let text = buff.toString('ascii');
  let link = await Anime.getFromLink(text)
  vdo = link.download
  name = link.name
  } catch {
     return res.end("Invalid link!")
  }
  res.render('watch', { vdo, name });
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

app.get("/search", async(req, res) => {
  let search = req.query.text;
  if(!search) return res.end("its dead end :/");
  let data = await Anime.search(search).catch(err => {
    data = []
  })

  res.render("search", {data, search})
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
