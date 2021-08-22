module.exports = (cache, Anime) => {
  setInterval(async () => {
    let scrapedRecent = await Anime.getRecentAnime()
    if (JSON.stringify(scrapedRecent) !== JSON.stringify(cache.recentAnime) && scrapedRecent.length) {
      cache.recentAnime = scrapedRecent
      console.log({ action: "Updated the Recent Anime!" })
    }
  }, 60000)
}
