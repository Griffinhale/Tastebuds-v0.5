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
      const filteredBook = data.items.filter(
        (book: any) => book.volumeInfo.imageLinks
      );
      const booksForCheck = filteredBook.map((book: any) => ({
        api_id: book.id,
        title: book.volumeInfo.title,
        cover: book.volumeInfo.imageLinks.thumbnail,
        description: book.volumeInfo.description || "",
        type: "book",
        creator: book.volumeInfo.authors,
      }));

      // Collect all api_ids for a batch check
      const apiIds = booksForCheck.map((book: any) => book.api_id);

      // Check for existing books in a batch
      const { data: existingBooks, error: existingBooksError } = await supabase
        .from("items")
        .select()
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
          .insert(newBooks)
          .select();

        if (insertError) {
          console.error("Error inserting new books: ", insertError);
          return;
        }

        insertedBooks = insertedData || [];
      }

      // Combine existing and new books, ensuring cover and api_id are included
      const combinedBooks = filteredBook.map((apiBook: any) => {
        // Find the corresponding book record from the database
        const dbBook =
          existingBookRecords.find((eBook) => eBook.api_id === apiBook.id) ||
          insertedBooks.find((iBook: any) => iBook.api_id === apiBook.id);
        console.log(dbBook);
        // Merge the API book data with the database record
        return {
          ...apiBook, // Original data from the Google Books API
          cover: dbBook?.cover, // Use cover from DB if available
          api_id: dbBook?.api_id, // Include api_id
          id: dbBook?.id, // Include the UUID id from the database
          title: dbBook?.title,
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
    const response = await fetch(searchURL, options);
    const data = await response.json();

    if (
      data.results &&
      data.results.filter((video: any) => video.media_type !== "person")
        .length > 0
    ) {
      const filteredResults = data.results.filter(
        (video: any) => video.poster_path
      );
      console.log(filteredResults);
      const videosForCheck = filteredResults.map((video: any) => ({
        api_id: video.id,
        title: video.title || video.name,
        description: video.overview,
        cover: "https://image.tmdb.org/t/p/w500" + video.poster_path,
        video_type: video.media_type,
        type: "video",
      }));

      // Collect all api_ids for a batch check
      const apiIds = videosForCheck.map((video: any) => video.api_id);
      // Check for existing videos in a batch
      const { data: existingVideos, error: existingVideosError } =
        await supabase.from("items").select().eq("api_id", apiIds);

      if (existingVideosError) {
        console.error(
          "Error checking for existing videos: ",
          existingVideosError
        );
        return;
      }

      const existingVideoRecords = existingVideos || [];
      // Determine which videos need to be inserted
      const newVideos = videosForCheck.filter(
        (video: any) =>
          !existingVideoRecords.find((eVideo) => eVideo.api_id === video.api_id)
      );

      // Insert new videos in a batch
      let insertedVideos: any = [];
      if (newVideos.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
          .from("items")
          .insert(newVideos)
          .select();

        if (insertError) {
          console.error("Error inserting new videos: ", insertError);
          return;
        }

        insertedVideos = insertedData || [];
      }

      // Combine existing and new videos
      const combinedVideos = videosForCheck.map((apiVideo: any) => {
        const dbVideo =
          existingVideoRecords.find(
            (eVideo: any) => eVideo.api_id == apiVideo.api_id
          ) ||
          insertedVideos.find(
            (iVideo: any) => iVideo.api_id == apiVideo.api_id
          );

        return {
          ...apiVideo,
          id: dbVideo?.id, // Include the UUID id from the database
          cover: dbVideo?.cover || apiVideo.cover,
          api_id: dbVideo?.api_id || apiVideo.id,
          type: "video",
        };
      });
      console.log("\n\nCV\n\n", combinedVideos);

      return combinedVideos;
    } else {
      return [{ items: false }];
    }
  } catch (error) {
    console.error(error);
  }
}

// Function to handle album search and insert new albums into database
async function handleAlbumSearch(body: { term: string; page: number }) {
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
    if (data.results.albummatches.album.length > 0) {
      //only include the albums with cover images
      const filteredResults = data.results.albummatches.album.filter(
        (a: { image: string | any[] }) =>
          a.image[a.image.length - 1]["#text"] !== ""
      );

      //grab cover links to compare against db
      const coverLinks = filteredResults.map(
        (a: any) => a.image[a.image.length - 1]
      );

      const { data: existingAlbums, error: existingAlbumsError } =
        await supabase.from("items").select().eq("cover", coverLinks);

      if (existingAlbumsError) {
        throw new Error("supabase read error: " + existingAlbumsError);
      }

      //filter results that aren't already in db
      const newAlbums = filteredResults
        .filter(
          (album: any) =>
            !existingAlbums.includes(
              (eAlbum: any) =>
                eAlbum.cover === album.image[album.image.length - 1]
            )
        )
        .map((a: any) => ({
          title: a.name,
          cover: a.image[a.image.length - 1]["#text"],
          type: "album",
          creator: a.artist,
        }));

      let insertedAlbums: any;
      if (newAlbums.length > 0) {
        const { data: insertedData, error: insertedDataError } = await supabase
          .from("items")
          .insert(newAlbums)
          .select();

        if (insertedDataError) {
          throw new Error("problem inserting albums" + insertedDataError);
        }
        insertedAlbums = insertedData;
        console.log(insertedAlbums);
      }
      //add db properties onto data for client use
      const combinedAlbums = filteredResults.map((apiAlbum: any) => {
        const dbVideo =
          existingAlbums.find(
            (eAlbum: any) =>
              eAlbum.cover ===
              apiAlbum.image[apiAlbum.image.length - 1]["#text"]
          ) ||
          insertedAlbums.find(
            (iAlbum: any) =>
              iAlbum.cover ===
              apiAlbum.image[apiAlbum.image.length - 1]["#text"]
          );

        return {
          ...apiAlbum,
          id: dbVideo.id,
          cover: dbVideo.cover,
          type: "album",
          creator: dbVideo.creator,
          title: dbVideo.title,
        };
      });
      return combinedAlbums;
    } else {
      return [{ items: false }];
    }
  } catch (error) {
    console.log("error:", error);
  }
}

// Function to handle game search and insert new games into the database
async function handleGameSearch(body: { term: string; page: number }) {

  // Fetch Twitch bearer token if not already retrieved
  if (igdbTwitchBearer === "") {
    igdbTwitchBearer = await getTwitchKeys();
    console.log("Twitch bearer: ", igdbTwitchBearer);
  }
  
  // Construct the body data and URL for IGDB API search
  const resultsOffset = body.page * 50 - 50;
  const bodyData = `search "${body.term}"; fields cover.*, *, platforms.*, keywords.*, genres.*;limit 50; offset ${resultsOffset};`;
  const url = "https://api.igdb.com/v4/games";
  const igdbIdKey = process.env.IGDB_ID_KEY;
  if (!igdbIdKey) {
        throw new Error("no igdb api key");
      }
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
  
  
  try {
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
    const filteredData = data.filter((game: { cover: undefined }) => game.cover !== undefined)
                              .map((game: any) => ({
                                title: game.name,
                                cover: game.cover.url.replace("t_thumb", "t_cover_big"), // get bigger thumbnail
                                api_id: game.id,
                                type: "game",
                                description: game.summary || "",
                              }))

    if (filteredData.length > 0) {
      // collect api ids for comparison with db
      const apiIds = filteredData.map((game: any) => ({
        api_id: game.api_id
      }));

      const {data: existingGames, error: existingGamesError} = await supabase
      .from("items")
      .select()
      .eq("api_id", apiIds);

      if (existingGamesError) {
        throw existingGamesError
      }

      // filter out existing games, determine which need to be inserted
      const newGames = filteredData.filter((game: any) => !existingGames.find((eGame: any) => game.id === eGame.api_id));
      
      let insertedGames: any[];

      if (newGames.length > 0) {
        const {data: insertedData, error: insertedDataError} = await supabase
        .from("items")
        .insert(newGames)
        .select();

        if (insertedDataError) {
          throw insertedDataError;
        }
        insertedGames = insertedData;
      }
      // add db id before returning data
      const combinedGames = filteredData.map((apiGame: any) => {
          const dbGame = existingGames.find((eGame: any) => eGame.api_id == apiGame.api_id) ||
                          insertedGames.find((iGame: any) => iGame.api_id == apiGame.api_id);
          console.log(dbGame);
          return {
            ...apiGame,
            id: dbGame.id,
          }
      })
      return combinedGames;
    } else {
      return [{items: false}];
    } 
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
