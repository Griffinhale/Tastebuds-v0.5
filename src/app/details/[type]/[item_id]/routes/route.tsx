import { useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { BsFileBreakFill } from "react-icons/bs";
let igdbTwitchBearer = "";

//type declarations
interface AlbumRequest {
  type: string;
  artist: string;
  album: string;
}


// Function to get Twitch access token for IGDB API
async function getTwitchKeys() {
  // Retrieve IGDB keys from environment variables
  const igdbIdKey = process.env.IGDB_ID_KEY;
  const igdbSecretKey = process.env.IGDB_SECRET_KEY;
  // Construct URL for obtaining the bearer token
  const bearerURL = `https://id.twitch.tv/oauth2/token?client_id=${igdbIdKey}&client_secret=${igdbSecretKey}&grant_type=client_credentials`;

  // Fetch the bearer token
  const response = await fetch(
    bearerURL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const igdbTwitch = await response.json(); 
  return igdbTwitch.access_token;
};

// API route to handle POST requests
export async function POST(req: NextRequest) {
  const body = await req.json();
  let results;
  // Switch case to handle different types of media
  switch(body.type) {
    case "album": results = await handleAlbumDetails(body); break;
    case "book": results = await handleBookDetails(body); break;
    case "game": results = await handleGameDetails(body); break;
    case "video": results = await handleVideoDetails(body); break;
    default: console.error("type of media missing");
  }

  // Return the results as JSON
  return new NextResponse(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}


// Function to handle album details
async function handleAlbumDetails(body: AlbumRequest){
  // Construct URL for album details
  const baseUrl = "http://ws.audioscrobbler.com/2.0/";
  const apiKey = process.env.LAST_FM_KEY;
  if (!apiKey) {
    throw new Error('LAST_FM_KEY is not set in environment variables');
  }
  const params = {
    method: "album.getinfo",
    api_key: apiKey,
    artist: body.artist,
    album: body.album,
    format: "json"
  };
  const encodedUrl = baseUrl + '?' + Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  
  // Fetch album details
  console.log(body, encodedUrl)
  const response = await fetch(encodedUrl)
  const data = await response.json()
  
  console.log("post api call", data);
  return [data];
}

// Function to handle book details
async function handleBookDetails(body: any) {
  // Construct URL for book details
  const searchURL = `https://www.googleapis.com/books/v1/volumes/${body.api_id}?key=${process.env.GOOGLE_API_KEY}`
  // Fetch book details
  const response = await fetch(searchURL);
  const data = await response.json();
  console.log(data);
  return data;
}

// Function to handle game details
async function handleGameDetails(body: any) {
  // Retrieve Twitch bearer token if not already retrieved
  if (igdbTwitchBearer === "") {
    igdbTwitchBearer = await getTwitchKeys();
    console.log(igdbTwitchBearer)
  }
  const igdbIdKey = process.env.IGDB_ID_KEY;
  if (igdbIdKey) {
    try {
      // Construct body data for IGDB API request
      const bodyData = `fields *, age_ratings.*, cover.*, collection.*, alternative_names.*, involved_companies.*,  external_games.*, genres.*, keywords.*, platforms.*, similar_games.*, release_dates.*, tags, websites.*; where id = ${body.api_id};`;
      const url = "https://api.igdb.com/v4/games";
  
      // Fetch game details
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Client-ID": igdbIdKey,
          Authorization: "Bearer " + igdbTwitchBearer,
        },
        body: bodyData,
      });
  
      const data = await response.json();
      console.log(data);
      // Additional request for company details if needed
      const bodyData2 =  `fields *; where changed_company_id=${data.involved_companies?data.involved_companies[0].id:""};`
      const url2 = "https://api.igdb.com/v4/companies";
  
      const response2 = await fetch(url2, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Client-ID": igdbIdKey,
          Authorization: "Bearer " + igdbTwitchBearer,
        },
        body: bodyData2,
      })
      const data2 = await response2.json();
      console.log("2",data2);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  
}

// Function to handle video details
async function handleVideoDetails(body: any) {
  let searchURL: string = "";
  // Retrieve TMDB API keys from environment variables
  const tmdbAuthHeader = process.env.TMDB_AUTH_HEADER
  const tmdbApiKey = process.env.TMDB_API_KEY;
  // Setup options for TMDB API request
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + tmdbAuthHeader,
    },
  };

  // Construct URL for video details based on video type
  switch(body.video_type) {
    case "tv":
      searchURL =  `https://api.themoviedb.org/3/tv/${body.api_id}?api_key=${tmdbApiKey}&append_to_response=credits,keywords,recommendations,similar,watch_providers`;
      break;
    case "movie":
      searchURL = `https://api.themoviedb.org/3/movie/${body.api_id}?api_key=${tmdbApiKey}&append_to_response=videos,credits,keywords,recommendations,similar`
      break;
  }

  console.log(searchURL);
  // Fetch video details
  const response = await fetch(searchURL, options);
  const data = await response.json();
  console.log(data);
  return data;
}