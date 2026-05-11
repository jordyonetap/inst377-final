const reviewsDiv = document.getElementById("reviews");
const form = document.getElementById("reviewForm");

// Load reviews
async function loadReviews() {
  const res = await fetch("/api/getReviews");
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error("Expected array but got:", data);
    return;
  }

  // Sort A-Z by artist name
  data.sort((a, b) => a.artist_name.localeCompare(b.artist_name));

  reviewsDiv.innerHTML = "";

  let genreScores = {};

  for (let r of data) {
    const score = Number(r.score);
    const scoreColor = score >= 8 ? "#4ade80" : score >= 5 ? "#facc15" : "#f87171";
    const dateStr = new Date(r.created_at).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });

    reviewsDiv.innerHTML += `
      <div class="review-card">
        <div class="review-card-header">
          <div class="review-title-block">
            <h3 class="review-artist">${r.artist_name}</h3>
            <span class="review-album">${r.album_name}</span>
          </div>
          <div class="review-score" style="color: ${scoreColor}">
            ${score}<span class="score-denom">/10</span>
          </div>
        </div>
        <div class="review-meta">
          <span class="review-genre">${r.genre}</span>
          <span class="review-date">${dateStr}</span>
        </div>
        <p class="review-text">${r.review}</p>
      </div>
    `;

    if (!genreScores[r.genre]) {
      genreScores[r.genre] = [];
    }
    genreScores[r.genre].push(score);

    loadAlbumArt(r.artist_name, r.album_name);
  }

  buildChart(genreScores);
}

// Save review
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector("button");
  btn.textContent = "Saving...";
  btn.disabled = true;

  const review = {
    artist_name: document.getElementById("artist").value,
    album_name: document.getElementById("album").value,
    genre: document.getElementById("genre").value,
    score: document.getElementById("score").value,
    review: document.getElementById("description").value
  };

  await fetch("/api/addReview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review)
  });

  btn.textContent = "Save Review";
  btn.disabled = false;
  form.reset();
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

  const slide = document.createElement("div");
  slide.className = "swiper-slide";
  slide.innerHTML = `<img src="https://coverartarchive.org/release/${release.id}/front" width="300">`;
  document.getElementById("carousel").appendChild(slide);

  new Swiper('.swiper');
}

// Chart.js
function buildChart(genreScores) {
  const labels = Object.keys(genreScores);
  const values = labels.map(g =>
    genreScores[g].reduce((a, b) => a + b) / genreScores[g].length
  );

  new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Avg Score",
        data: values,
        backgroundColor: "rgba(250, 204, 21, 0.7)",
        borderColor: "#facc15",
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { min: 0, max: 10, ticks: { color: "#ccc" }, grid: { color: "#333" } },
        x: { ticks: { color: "#ccc" }, grid: { color: "#333" } }
      },
      plugins: { legend: { labels: { color: "#ccc" } } }
    }
  });
}

loadReviews();