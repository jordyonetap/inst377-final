//api call 3: fetch album art from MusicBrainz and Cover Art Archive

export default async function handler(req, res) {
  const { artist, album } = req.query;

  if (!artist || !album) {
    return res.status(400).json({ error: "Missing artist or album query params" });
  }

  try {
    // Check MusicBrainz for the release group ID based on artist and album name
    const searchRes = await fetch(
      `https://musicbrainz.org/ws/2/release-group?query=artist:"${encodeURIComponent(artist)}" AND release:"${encodeURIComponent(album)}"&fmt=json`,
      { headers: { "User-Agent": "MusicReviewApp/1.0 (student-project)" } }
    );
    const searchData = await searchRes.json();

    const rg = searchData["release-groups"]?.[0];
    if (!rg) return res.status(404).json({ error: "Release group not found" });

    // Step 2: Get image for release from Cover Art Archive
    const relRes = await fetch(
      `https://musicbrainz.org/ws/2/release?release-group=${rg.id}&fmt=json`,
      { headers: { "User-Agent": "MusicReviewApp/1.0 (student-project)" } }
    );
    const relData = await relRes.json();

    const release = relData.releases?.[0];
    if (!release) return res.status(404).json({ error: "Release not found" }); //no releases, return error
 
    return res.status(200).json({
      releaseId: release.id,
      artUrl: `https://coverartarchive.org/release/${release.id}/front`,
      artist,
      album
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
