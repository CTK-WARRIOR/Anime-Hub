const Anime = require("ctk-anime-scraper")

module.exports = (fish) => {
setInterval(async () => {
  let scrapedPopular = await Anime.getPopularAnime()
  if(JSON.stringify(scrapedPopular) !== JSON.stringify(fish.popularAnime) && scrapedPopular.length) {
    fish.popularAnime = scrapedPopular
    console.log({action: "Updated the Popular Anime!"})
  }
}, 60000)
}
