import { useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import supabase from "../../utils/supabaseClient";
import { BsFileBreakFill } from "react-icons/bs";
let igdbTwitchBearer = "";

async function getTwitchKeys() {
  const igdbIdKey = process.env.IGDB_ID_KEY;
  const igdbSecretKey = process.env.IGDB_SECRET_KEY;
  const bearerURL = `https://id.twitch.tv/oauth2/token?client_id=${igdbIdKey}&client_secret=${igdbSecretKey}&grant_type=client_credentials`;

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

export async function POST(req: NextRequest) {
  const body = await req.json();
  let results;
  console.log(body);
  switch(body.type) {
    case "album": results = await handleAlbumDetails(body); break;
    case "book": results = await handleBookDetails(body); break;
    case "game": results = await handleGameDetails(body); break;
  }
  
  
  return new NextResponse(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function handleAlbumDetails(body){
    const searchURL = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${process.env.LAST_FM_KEY}&artist=${body.artist}&album=${body.album}&format=json`;
    const response = await fetch(searchURL)
    const data = await response.json()
    console.log(data.album.tracks);
    return data;
}

async function handleBookDetails(body) {
  const searchURL = `https://www.googleapis.com/books/v1/volumes/${body.api_id}?key=${process.env.GOOGLE_API_KEY}`
  const response = await fetch(searchURL);
  const data = await response.json();
  console.log(data);
  return data;
}

async function handleGameDetails(body) {
  if (igdbTwitchBearer === "") {
    igdbTwitchBearer = await getTwitchKeys();
    console.log(igdbTwitchBearer)
  }
  const igdbIdKey = process.env.IGDB_ID_KEY;
  
  try {

    const bodyData = `fields *, age_ratings.*, cover.*, collection.*, alternative_names.*, involved_companies.*,  external_games.*, genres.*, keywords.*, platforms.*, similar_games.*, release_dates.*, tags, websites.*; where id = ${body.api_id};`;
    const url = "https://api.igdb.com/v4/games";

    

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
    const bodyData2 =  `fields *; where changed_company_id=${data.involved_companies?data.involved_companies[0].id: ""};`
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
