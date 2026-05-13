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
  document.getElementById("carousel").innerHTML = "";

  let genreScores = {};

  for (let r of data) {
    const score = Number(r.score);
    const scoreColor = score >= 8 ? "#4ade80" : score >= 5 ? "#facc15" : "#f87171";
    const dateStr = new Date(r.created_at).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });

    const cardId = `card-${r.artist_name}-${r.album_name}`.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");

    reviewsDiv.innerHTML += `
      <div class="review-card" id="${cardId}">
        <div class="review-card-header">
          <div class="review-art-slot" id="${cardId}-art">
            <div class="art-placeholder"></div>
          </div>
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

    // Now calls our backend endpoint instead of MusicBrainz directly
    loadAlbumArt(r.artist_name, r.album_name, cardId);
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

// Album art now fetched via our own backend endpoint (3rd fetch call)
async function loadAlbumArt(artist, album, cardId) {
  try {
    const res = await fetch(
      `/api/getAlbumArt?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`
    );
    const data = await res.json();
    if (data.error || !data.artUrl) return;

    // Inject into the review card art slot
    const artSlot = document.getElementById(`${cardId}-art`);
    if (artSlot) {
      artSlot.innerHTML = `<img class="card-art" src="${data.artUrl}" alt="${album} cover" onerror="this.parentElement.innerHTML=''">`;
    }

    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `
      <div class="slide-inner">
        <img src="${data.artUrl}" alt="${data.album} by ${data.artist}" onerror="this.parentElement.parentElement.remove()">
        <div class="slide-caption">
          <span class="slide-artist">${data.artist}</span>
          <span class="slide-album">${data.album}</span>
        </div>
      </div>
    `;
    document.getElementById("carousel").appendChild(slide);

    if (window._swiper) window._swiper.destroy(true, true);
    window._swiper = new Swiper(".swiper", {
      loop: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  } catch (err) {
    console.warn("Could not load album art for", artist, album);
  }
}

// Chart.js
function buildChart(genreScores) {
  const existingChart = Chart.getChart("chart");
  if (existingChart) existingChart.destroy();

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