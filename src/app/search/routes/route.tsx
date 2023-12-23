import { useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import supabase from "../../utils/supabaseClient";
import { BsFileBreakFill } from "react-icons/bs";
let igdbTwitchBearer = "";

// Function to get Twitch access token for IGDB API
async function getTwitchKeys() {
  // Retrieve IGDB keys from environment variables
  const igdbIdKey = process.env.IGDB_ID_KEY;
  const igdbSecretKey = process.env.IGDB_SECRET_KEY;
  if (!igdbIdKey || !igdbSecretKey) {
    throw new Error("missing api keys");
  }
  // Construct URL for obtaining the bearer token
  const bearerURL = `https://id.twitch.tv/oauth2/token?client_id=${igdbIdKey}&client_secret=${igdbSecretKey}&grant_type=client_credentials`;

  // Fetch the bearer token
  const response = await fetch(bearerURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const igdbTwitch = await response.json();
  return igdbTwitch.access_token;
}

// API route to handle POST requests for different types of media searches
export async function POST(req: NextRequest) {
  // Parse the request body
  const body = await req.json();
  let results;
  console.log(body);

  // Switch case to handle different types of media searches
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

// Function to handle book search and insert new books into database
async function handleBookSearch(body: { term: string; page: number }) {
  // Construct the URL for Google Books API search
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
    const response = await fetch(searchURL); // Construct and execute the search URL as before
    const data = await response.json();

    if (data.items) {
      // Prepare books for checking in the database
      const booksForCheck = data.items
        .filter((book: any) => book.volumeInfo.imageLinks)
        .map((book: any) => ({
          api_id: book.id,
          title: book.volumeInfo.title,
          cover: book.volumeInfo.imageLinks.thumbnail,
          description: book.volumeInfo.description || "",
          type: "book",
        }));

      // Collect all api_ids for a batch check
      const apiIds = booksForCheck.map((book: any) => book.api_id);

      // Check for existing books in a batch
      const { data: existingBooks, error: existingBooksError } = await supabase
        .from("items")
        .select("api_id, id")
        .in("api_id", apiIds);

      if (existingBooksError) {
        console.error(
          "Error checking for existing books: ",
          existingBooksError
        );
        return;
      }

      // Ensure existingBooks is an array
      const existingBookRecords = existingBooks || [];

      // Determine which books need to be inserted
      const newBooks = booksForCheck.filter(
        (book: any) =>
          !existingBookRecords.find((eBook) => eBook.api_id === book.api_id)
      );

      // Insert new books in a batch
      let insertedBooks: any = [];
      if (newBooks.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
          .from("items")
          .insert(newBooks);

        if (insertError) {
          console.error("Error inserting new books: ", insertError);
          return;
        }

        insertedBooks = insertedData || [];
      }

      // Combine existing and new books, ensuring cover and api_id are included
  const combinedBooks = data.items.map((apiBook) => {
    // Find the corresponding book record from the database
    const dbBook = existingBookRecords.find((eBook) => eBook.api_id === apiBook.id) ||
                   insertedBooks.find((iBook) => iBook.api_id === apiBook.id);

    // Merge the API book data with the database record
    return {
      ...apiBook, // Original data from the Google Books API
      cover: dbBook?.cover || apiBook.volumeInfo.imageLinks?.thumbnail, // Use cover from DB if available
      api_id: dbBook?.api_id || apiBook.id, // Include api_id
      id: dbBook?.id, // Include the UUID id from the database
      title: dbBook?.title || apiBook.volumeInfo.title,
      type: "book",
    };
  });

  return combinedBooks;
    } else {
      return [{ items: false }];
    }
  } catch (error) {
    console.error(error);
  }
}
// Function to handle video search and insert new videos into database
async function handleVideoSearch(body: { term: string; page: number }) {
  // Function to insert a video into the database if it doesn't exist
  async function insertVideo(video: {
    api_id: any;
    title: any;
    description: any;
    cover: any;
    media_type: any;
  }) {
    // Check if the video already exists in the database
    const { data: existingVideos, error: existingVideosError } = await supabase
      .from("items")
      .select("*")
      .eq("api_id", video.api_id);

    // If the video doesn't exist, insert it into the database
    if (existingVideos!.length === 0) {
      const { data: newVideo, error: newVideoError } = await supabase
        .from("items")
        .insert([
          {
            api_id: video.api_id,
            title: video.title,
            description: video.description,
            cover: video.cover,
            type: "video",
            video_type: video.media_type,
          },
        ])
        .select();

      if (newVideoError) {
        console.log("\n\nERROR\n\n", newVideoError);
        return;
      }
      console.log("newVideo:", newVideo);
      return newVideo![0].id;
    } else {
      return existingVideos![0].id;
    }
  }

  // Construct the URL for TMDB API search
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
    // Fetch video data from TMDB API
    const response = await fetch(searchURL, options);
    const data = await response.json();
    if (
      data.results.filter((video: any) => video.media_type !== "person")
        .length > 0
    ) {
      const resultsPromises = data.results
        .filter((video: { poster_path: any }) => video.poster_path)
        .map(async (video: any) => {
          // Process and insert each video into the database
          video.description = video.overview;
          if (!video.title) {
            video.title = video.name;
          }
          delete video.overview;
          video.cover = "https://image.tmdb.org/t/p/w500" + video.poster_path;
          video.api_id = video.id;
          video.id = await insertVideo(video);
          video.type = "video";
          return video;
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

// Function to handle album search and insert new albums into database
async function handleAlbumSearch(body: { term: string; page: number }) {
  // Function to insert an album into the database if it doesn't exist
  async function insertAlbum(album: { cover: any; title: any; creator: any }) {
    try {
      // Check if the album already exists in the database
      const { data: existingAlbums, error: existingAlbumsError } =
        await supabase.from("items").select("*").eq("cover", album.cover);
      if (existingAlbumsError) {
        console.log("\n\nERROR\n\n", existingAlbumsError);
        return;
      }

      // If the album doesn't exist, insert it into the database
      if (existingAlbums!.length === 0) {
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
        return newAlbum[0]!.id;
      } else {
        return existingAlbums![0].id;
      }
    } catch (err) {
      console.log("supabase error: " + err);
    }
  }

  // Construct the URL for LastFM API search
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
    // Fetch album data from LastFM API
    const response = await fetch(searchURL);
    const data = await response.json();

    const results = await Promise.all(
      data.results.albummatches.album
        .filter(
          (album: { image: string | any[] }) =>
            album.image[album.image.length - 1]["#text"] !== ""
        )
        .map(
          async (album: {
            cover: any;
            image: string | any[];
            title: any;
            name: any;
            creator: any;
            artist: any;
            type: string;
            id: any;
          }) => {
            // Process and insert each album into the database
            album.cover = album.image[album.image.length - 1]["#text"];
            album.title = album.name;
            album.creator = album.artist;
            album.type = "album";
            try {
              album.id = await insertAlbum(album);
            } catch (err) {
              console.log("problem with insert album");
            }
            return album;
          }
        )
    );

    return results;
  } catch (error) {
    console.log("error:", error);
  }
}

// Function to handle game search and insert new games into the database
async function handleGameSearch(body: { term: string; page: number }) {
  // Function to insert a game into the database if it doesn't exist
  async function insertGame(game: {
    api_id: any;
    cover: any;
    title: any;
    description: any;
  }) {
    // Check if the game already exists in the database
    const { data: existingGames, error: existingGamesError } = await supabase
      .from("items")
      .select("*")
      .eq("api_id", game.api_id);

    if (existingGamesError) {
      console.log("existing games error: ", existingGamesError);
      return;
    }

    // If the game doesn't exist, insert it into the database
    if (existingGames.length === 0) {
      const { data: newGame, error: newGameError } = await supabase
        .from("items")
        .insert([
          {
            api_id: game.api_id,
            cover: game.cover,
            title: game.title,
            description: game.description,
            type: "game",
          },
        ])
        .select();

      if (newGameError) {
        console.log("new game error: ", newGameError);
        return;
      }
      return newGame[0].id;
    } else {
      return existingGames[0].id;
    }
  }

  // Fetch Twitch bearer token if not already retrieved
  if (igdbTwitchBearer === "") {
    igdbTwitchBearer = await getTwitchKeys();
    console.log("Twitch bearer: ", igdbTwitchBearer);
  }

  // Construct the body data and URL for IGDB API search
  const igdbIdKey = process.env.IGDB_ID_KEY;
  try {
    const resultsOffset = body.page * 50 - 50;
    const bodyData = `search "${body.term}"; fields cover.*, *, platforms.*, keywords.*, genres.*;limit 50; offset ${resultsOffset};`;
    const url = "https://api.igdb.com/v4/games";

    console.log(
      "IGDB API call\npage: " +
        body.page +
        "\nterm: " +
        body.term +
        "\nURL: " +
        url +
        "\nbody: " +
        bodyData
    );
    if (!igdbIdKey) {
      throw new Error("no igdb api key");
    }
    // Fetch game data from IGDB API
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

    let results;
    if (
      data.filter((game: { cover: undefined }) => game.cover !== undefined)
        .length > 0
    ) {
      let resultsPromises = data
        .filter((game: { cover: undefined }) => game.cover !== undefined)
        .map(async (game: any) => {
          // Process and insert each game into the database
          game.title = game.name;
          game.cover = game.cover.url.replace("t_thumb", "t_cover_big");
          game.api_id = game.id;
          game.id = await insertGame(game);
          game.type = "game";
          game.description = game.summary;
          return game;
        });
      results = await Promise.all(resultsPromises);
    } else {
      results = [{ items: false }];
    }
    return results;
  } catch (error) {
    console.log(error);
  }
}

// Function to handle library search (currently empty)
async function handleLibrarySearch(body: any) {
  try {
    // Logic to handle library search goes here
  } catch (error) {
    // Error handling for library search
  }
}

// Function to handle list search (currently empty)
async function handleListSearch(body: any) {
  try {
    // Logic to handle list search goes here
  } catch (error) {
    // Error handling for list search
  }
}
