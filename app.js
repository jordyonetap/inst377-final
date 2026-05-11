const reviewsDiv = document.getElementById("reviews");
const form = document.getElementById("reviewForm");

// Load reviews
async function loadReviews() {
  const res = await fetch("/api/getReviews");
  const data = await res.json();

  console.log(data);

  reviewsDiv.innerHTML = "";

  let genreScores = {};

  for (let r of data) {
    reviewsDiv.innerHTML += `
      <div>
        <h3>${r.artist_name} - ${r.album_name}</h3>
        <p>${r.genre} | Score: ${r.score}</p>
        <p>${r.review}</p>
      </div>
    `;

    // collect for chart
    if (!genreScores[r.genre]) {
      genreScores[r.genre] = [];
    }
    genreScores[r.genre].push(r.score);

    // fetch album art
    loadAlbumArt(r.artist, r.album);
  }

  buildChart(genreScores);
}

// Save review
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const review = {
    artist_name: document.getElementById("artist").value,
    album_name: document.getElementById("album").value,   
    genre: document.getElementById("genre").value,
    score: document.getElementById("score").value,
    review: document.getElementById("description").value   
  };

  await fetch("/api/addReview", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(review)
  });

  loadReviews();
});

// Album art via MusicBrainz + Cover Art
async function loadAlbumArt(artist, album) {
  const search = await fetch(
    `https://musicbrainz.org/ws/2/release-group?query=artist:"${artist}" AND release:"${album}"&fmt=json`
  );
  const data = await search.json();

  const rg = data["release-groups"]?.[0];
  if (!rg) return;

  const rel = await fetch(
    `https://musicbrainz.org/ws/2/release?release-group=${rg.id}&fmt=json`
  );
  const relData = await rel.json();

  const release = relData.releases?.[0];
  if (!release) return;

  const img = document.createElement("div");
  img.className = "swiper-slide";
  img.innerHTML = `<img src="https://coverartarchive.org/release/${release.id}/front" width="300">`;

  document.getElementById("carousel").appendChild(img);

  new Swiper('.swiper');
}

// Chart.js
function buildChart(genreScores) {
  const labels = Object.keys(genreScores);
  const values = labels.map(g =>
    genreScores[g].reduce((a,b)=>a+b)/genreScores[g].length
  );

  new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Avg Score",
        data: values
      }]
    }
  });
}

loadReviews();