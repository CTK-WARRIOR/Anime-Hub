const AnimeScraper = require("ctk-anime-scraper")
const Gogoanime = new AnimeScraper.Gogoanime()

/* Search Anime */
Gogoanime.search("search").then(results => {
/* Get the top result from search and fetch that anime */
	Gogoanime.fetchAnime(results[0].link).then(anime => {
	/* Get the 1st Episode of the anime */
		Gogoanime.getEpisodes(anime.slug, 1).then(episode => {
		/* Here you have it, Enjoy 😉 */
			console.log(episode) // {Object}
		})
	})
})
