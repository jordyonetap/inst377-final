# SpinRate: The Anonymous Album Reviewing Web App

**This web app allows you to write a brief review on an album and store it in a database. It asks for the artist, album, genre, score 1-10, and a brief description as to why. It displays previously created reviews, the artwork of each album reviewed, and the average score of albums across genre.**

_This web app is intended for Chrome on Windows. Firefox, Safari, and Edge all appear to work as well, but thorough testing was not conducted on each._ 

[Link To Developer Manual](#Developer-Manual)


# Developer Manual

## How to Install Application and all Dependencies

**Please make sure that Visual Studio Code is installed, as well as Node.js.**

> To install all dependencies, you must run the following:

```bash
git clone https://github.com/jordyonetap/inst377-final.git
cd inst377-final
npm init -y
npm install --save-dev jest
npm install --save-dev babel-jest @babel/core @babel/preset-env
```
This clones the repository to your machine, sets the folder path, and initializes npm (should have been installed with node.js)

The two additional installs are optional, but are needed to run API tests. 

## How to run Application on a Vercel Server

**To run the application on a vercel server, you must complete the following steps:**
1. Login to GitHub
2. Create a new repository
3. Upload Content from inst377-final to GitHub repository
4. Make a Vercel account and login
5. Go to Projects -> Add New -> Project
6. Connect your GitHub account to Vercel
7. Import the Git repository into your project
8. Review all options, then press "Deploy"
9. Find the domain name for the site in the Overview tab of your Vercel Project
 After following the url, you should be able to see your website! If not, look for errors on Vercel's deployment.
> To make a change to the vercel server, simply commit your files to the Git repository. Make sure that it gets deployed on Vercel's end.

## How to run software tests

**To run a test on the project's API calls, simply type
```bash
npm test
```
This runs all files ending in .test.js, returning results to if they work or not.

Extra tests can be created, simply end the file name with .test.js

Make sure that Jest is installed as well as Babel to make sure the syntax is working. 

## Server Application API

### `GET /api/getReviews`

Fetches all reviews from Supabase database

**Parameters:** None

**Response:** 
```json
[
 {
  "artist_name": "Radiohead",
  "album_name": "In Rainbows",
  "genre": "Rock",
  "score": "9"
  "review": "Their greatest album and a work of art."
  "created_at": "2026-05-13T00:00:00.000Z"
 }
]
```

### `POST /api/addReview`

Writes a new review to Supabase database

**Request:**

```json
[
 {
  "artist_name": "Radiohead",
  "album_name": "In Rainbows",
  "genre": "Rock",
  "score": "9"
  "review": "Their greatest album and a work of art."
 }
]
```
**Response:** Returns response gathered from Supabase database.

### `POST /api/getAlbumArt`

Gets the album artwork for a specific album/artist combo. First finds the release ID thru MusicBrainz, then gets the image from Cover Art Archive.

**Parameters:** 
> ``` artist ``` type = string
>> _Represents the name of the artist_

> ``` album ``` type = string
>> _Represents the name of the album_

For example ping ``` /api/getAlbumArt?artist=Radiohead&album=In_Rainbows```

**Response:**

```json
{
  "releaseId": "6e335887-60ba-38f0-95af-fae7774336bf",
  "artUrl": "https://coverartarchive.org/release/6e335887-60ba-38f0-95af-fae7774336bf/front",
  "artist": "Radiohead",
  "album": "In Rainbows"
```

## Bugs and Future Roadmap

### **BUGS**

**Score Validation**

**Problem:** The score does not accept any non-integer values. 

**Fix:** Adjust the variable to be a float, not an integer.

----------

**Album art failures**

**Problem:** The third-party API for recieving album art is often down. If it returns no results for a given artist/album, the artwork section may display broken placeholders.

**Fix:** Add a fallback image in `getAlbumArt.js`

----------

**Updating Reviews**

**Problem:** New reviews from other users are not displayed until the tab is refreshed

**Fix:** Force refresh page when a new response comes into the table

----------

**Updating Average Scores**

**Problem:** The genre average score does not update after a new review is submitted until the tab is refreshed.

**Fix:** Force refresh page when a new response comes into the table

----------
### **FUTURE ROADMAP**

**High Priority**

**Medium Priority**

**Low Priority**

----------

*Last Updated: May 13, 2026*

