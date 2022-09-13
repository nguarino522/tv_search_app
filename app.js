"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  let result = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
  return result.data;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  
  for (let data of shows) {
    let imageUrl = "";
    if (data.show.image !== null){
      imageUrl = data.show.image.medium;
    } else {
      imageUrl = "https://tinyurl.com/tv-missing";
    }

    const $show = $(
        `<div data-show-id="${data.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${imageUrl}" 
              alt="${data.show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-light">${data.show.name}</h5>
             <div class="text-light"><small>${data.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
  let result = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  return result.data;
}

// populdate passed in episodes array from API to list elemetn in UL on page and show list area
function populateEpisodes(episodes) {
  let $episodesList = $("#episodes-list");
  $episodesList.empty();
  for (let ep of episodes) {
    let $ep = $(
      `<li class="text-light">${ep.name} (season ${ep.season}, episode ${ep.number})</li>`
    );
    $episodesList.append($ep);
  }
  $episodesArea.show();
}

// listen for episodes button press, set show ID, then grab all episodes list from API
// after setting episodes from API request, populate them onto the page 
document.querySelector("#shows-list").addEventListener("click", async function(e){
  let showId = e.target.closest(".Show").dataset.showId;
  let episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
})