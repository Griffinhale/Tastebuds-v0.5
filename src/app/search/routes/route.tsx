import { useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import supabase from "../../utils/supabaseClient";
import { BsFileBreakFill } from "react-icons/bs";
import TurndownService from "turndown"
let igdbTwitchBearer = "";
const turndownService = new TurndownService();

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
  switch (body.type) {
    case "book":
      results = await handleBookSearch(body);
      break;
    case "video":
      results = await handleVideoSearch(body);
      break;
    case "album":
      results = await handleAlbumSearch(body);
      break;
    case "game":
      results = await handleGameSearch(body);
      break;
    default:
      console.log("type not implemented");
  }

  
  return new NextResponse(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function handleBookSearch(body) {
  async function insertBook(book) {
    const { data: existingBooks, error: existingBooksError } = await supabase
      .from("items")
      .select("*")
      .eq("api_id", book.api_id);
    if (existingBooksError) {
      console.log("Error checking for existing books: ", existingBooksError);
      return;
    }
    if (existingBooks.length === 0) {
      let { data: newBook, error: newBookError } = await supabase
        .from("items")
        .insert([
          {
            api_id: book.api_id,
            title: book.title,
            description: book.description ? turndownService.turndown(book.description) : "",
            cover: book.cover,
            creator: book.volumeInfo.authors?book.volumeInfo.authors[0]: "",
            type: "book",
          },
        ])
        .select();
      if (newBookError) {
        console.log("error inserting book: ", newBookError);
        return;
      }

      console.log(newBook[0].id);
      return newBook[0].id;
    } else {
      console.log("existing book", existingBooks[0].id);
      return existingBooks[0].id;
    }
  }
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const searchURL = `https://www.googleapis.com/books/v1/volumes?q=intitle:${
    body.term
  }&maxResults=40&printType=books&startIndex=${
    body.page * 40
  }&key=${googleApiKey}`;
  console.log(
    "Book Search\nTerm: " +
      body.term +
      "\nPage: " +
      body.page +
      "\nURL: " +
      searchURL
  );
  try {
    const response = await fetch(searchURL);
    const data = await response.json();
    if (data.items) {
      const resultsPromises = data.items
        .filter((book) => book.volumeInfo.imageLinks)
        .map(async (book) => {
          book.cover = book.volumeInfo.imageLinks.thumbnail;
          book.api_id = book.id;
          book.title = book.volumeInfo.title;
          book.description = book.volumeInfo.description
            ? book.volumeInfo.description
            : "";
          book.id = await insertBook(book);
          book.type = "book";
          return book;
        });
      const results = await Promise.all(resultsPromises);
      return results;
    } else {
      return [{ items: false }];
    }
  } catch (error) {
    console.log(error);
  }
}

async function handleVideoSearch(body) {
  async function insertVideo(video) {
    const { data: existingVideos, error: existingVideosError } = await supabase
      .from("items")
      .select("*")
      .eq("api_id", video.api_id)
      .select();

    if (existingVideos.length === 0) {
      const { data: newVideo, error: newVideoError } = await supabase
        .from("items")
        .insert([
          {
            api_id: video.api_id,
            title: video.title,
            description: video.description,
            cover: video.cover,
            type: "video",
          },
        ])
        .select();

      if (newVideoError) {
        console.log("\n\nERROR\n\n", newVideoError);
        return;
      }
      console.log("newVideo:", newVideo);
      return newVideo[0].id;
    } else {
      return existingVideos[0].id;
    }
  }
  const tmdbApiKey = process.env.TMDB_API_KEY;
  const tmdbAuthHeader = process.env.TMDB_AUTH_HEADER;
  const searchURL = `https://api.themoviedb.org/3/search/multi?query=${body.term}&include_adult=false&language=en-US&page=${body.page}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + tmdbAuthHeader,
    },
  };

  console.log(
    "TMDB API call\npage: " +
      body.page +
      "\nterm: " +
      body.term +
      "\nURL: " +
      searchURL
  );

  try {
    const response = await fetch(searchURL, options);
    const data = await response.json();
    console.log(data);
    if (data) {
      const resultsPromises = data.results
        .filter((video) => video.poster_path)
        .map(async (video) => {
          video.description = video.overview;
          if (!video.title) {
            video.title = video.name;
          }
          delete video.overview;
          video.cover = "https://image.tmdb.org/t/p/w500" + video.poster_path;
          video.api_id = video.id;
          video.id = await insertVideo(video, options);
          video.type = "video";
          return video;
        });
      const results = await Promise.all(resultsPromises);
      console.log(results);
      return results;
    } else {
      return [{ items: false }];
    }
  } catch (error) {
    console.log(error);
  }
}

async function handleAlbumSearch(body) {
  async function insertAlbum(album) {
    const { data: existingAlbums, error: existingAlbumsError } = await supabase
      .from("items")
      .select("*")
      .eq("cover", album.cover)
      .select();
    
   
    if (existingAlbums.length === 0) {
      const { data: newAlbum, error: newAlbumError } = await supabase
        .from("items")
        .insert([
          {
            title: album.title,
            creator: album.creator,
            cover: album.cover,
            type: "album",
          },
        ])
        .select();

      if (newAlbumError) {
        console.log("\n\nERROR\n\n", newAlbumError);
        return;
      }

      return newAlbum[0].id;
    } else {
      return existingAlbums[0].id;
    }
  }
  const lastFmApiKey = process.env.LAST_FM_KEY;

  const searchURL = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${body.term}&limit=40&page=${body.page}&api_key=${lastFmApiKey}&format=json`;

  console.log(
    "LastFM API call\npage: " +
      body.page +
      "\nterm: " +
      body.term +
      "\nURL: " +
      searchURL
  );

  try {
    const response = await fetch(searchURL);
    const data = await response.json();
    console.log(data.results.albummatches.album[0].mbid);
    const resultsPromises = data.results.albummatches.album
      .filter((album) => album.image[album.image.length - 1]["#text"] !== "")
      .map(async (album) => {
        album.cover = album.image[album.image.length - 1]["#text"];
        album.title = album.name;
        album.creator = album.artist;
        album.type = "album";
        album.id = await insertAlbum(album);
        return album;
      });
    const results = await Promise.all(resultsPromises);
    console.log("results:", results);
    return results;
  } catch (error) {
    console.log("error:", error);
  }
}

async function handleGameSearch(body) {
  async function insertGame(game) {
    const {data: existingGames, error: existingGamesError} = await supabase
    .from("items")
    .select("*")
    .eq("api_id", game.api_id)

    if (existingGamesError) {
      console.log("existing games error: ", existingGamesError);
      return;
    }

    if (existingGames.length === 0) {
      const {data: newGame, error: newGameError} = await supabase
      .from("items")
      .insert([{
        api_id: game.api_id,
        cover: game.cover,
        title: game.title,
        description: game.description,
        type: "game",
      }])
      .select();
      

      if (newGameError) {
        console.log("new game error: ", newGameError);
        return;
      }
      
      console.log(newGame[0].id)

      return newGame[0].id;
    } else {
      return existingGames[0].id;
    }
    

  }
  
  if (igdbTwitchBearer === "") {
    igdbTwitchBearer = await getTwitchKeys();
    console.log(igdbTwitchBearer)
  }
  const igdbIdKey = process.env.IGDB_ID_KEY;
  
  try {

    const bodyData = `search "${body.term}"; fields cover.*, *, platforms.*, keywords.*, genres.*;limit 50;`;
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
    
    let resultsPromises = data
        .filter((game) => game.cover !== undefined)
        .map(async (game) => {
          game.title = game.name;
          game.cover = game.cover.url.replace("t_thumb", "t_cover_big");
          game.api_id = game.id;
          game.id = await insertGame(game);
          game.type = "game";
          game.description = game.summary;
          return game;
        });
    const results = await Promise.all(resultsPromises);
    
    return results;
      

  } catch (error) {
    console.log(error);
  }
}

async function handleLibrarySearch(body) {
  try {
  } catch (error) {}
}

async function handleListSearch(body) {
  try {
  } catch (error) {}
}
