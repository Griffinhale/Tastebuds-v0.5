// Use client-side rendering for this component
"use client";

// Import necessary hooks and utilities
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useEffect } from "react";
import useState from "react-usestateref";
import supabase from "../utils/supabaseClient"; // Importing Supabase client
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi";
import toast from "react-hot-toast";
import extractDataFromCookie from "../utils/extractCookie";

interface Params {
  params: [string, string];
}

// The AlbumDetails component, receiving 'params' as props
const AlbumDetails: React.FC<Params> = ({ params }) => {
  interface ResultItem {
  album: object;
  wiki: string
}
  // State management for various purposes
  const [results, setResults, resultsRef] = useState<any>([]); // Stores fetched data, its setter, and a ref
  const [isLoading, setIsLoading, isLoadingRef] = useState(true); // Manages loading state
  const [cover, setCover] = useState(""); // Stores album cover URL
  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false); // State to check if book is already in library
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false); // State to check if book was added to library
  const [userId, setUserId, userIdRef] = useState(""); // State for storing user ID

  // A function to handle album type selection logic (currently empty)
  /*function selectAlbumType() {
    console.log();
    console.log(resultsRef.current[0].album);
    console.log(typeof resultsRef.current[0].album === "object");
  }*/
  const addToLibrary = async () => {
    // Fire toast notification if no user logged in
    if (userId === "") {
      toast.error("Log in to add to Library");
      console.log("no user");
      return; // This will exit the addToLibrary function
    }

    // Querying supabase to check if the book is already in the user's library
    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userIdRef.current);
    let isInUserLibrary = false;
    // Check if the book is already in the library
    if (existingItem) {
      const filtered = existingItem.filter(
        (item) => item.item_id === params[1]
      );
      if (filtered.length > 0) {
        isInUserLibrary = true;
        setAddedToLib(true);
        setAlreadyInLib(true);
        console.log("already in library");
        toast.error("Already in Library!");
      }
    } else if (existingItemError) {
      console.log(existingItemError);
    }
    // Add book to the library if it's not already there
    if (!isInUserLibrary) {
      setAddedToLib(true);
      const { error } = await supabase.from("library").insert({
        item_id: params[1],
        user_id: userId,
      });
      if (error) {
        console.log(error);
      } else {
        toast.success("Added to Library!");
      }
    }
  };

  // Extract user data from cookies
  useEffect(() => { 
    const data = extractDataFromCookie();
    if (data) {
      setUserId(data.userId); // Set user ID state from extracted data
    } else {
      console.log("auth_data not found in cookie");
      setUserId(""); // Clear user ID if auth data not found
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch further details from API
  useEffect(() => {
    async function getAlbumDetails(item_id: string) {
      // Fetching base album details from Supabase
      const { data: albumDetails, error: albumDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      // Logging and setting state with fetched data
      
      const artist = albumDetails![0].creator;
      const album = albumDetails![0].title;
      setCover(albumDetails![0].cover);
      const bodyData = { type: params[0], artist: artist, album: album };

      // Making a POST request to a server route
      const response = await fetch(
        "/details/" + params[0] + "/" + params[1] + "/routes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );
      const data = await response.json();
      if (data.error) {
        toast.error("No details found, try again");
        return;
      } else {
      setResults(data);
      setIsLoading(false);
      return data;
      } 
    }
    const details = getAlbumDetails(params[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]); // Rerun effect when params state changes

  // JSX for rendering the component
  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      {/* Main Content */}
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        {/* Conditional rendering based on loading state */}
        {isLoadingRef.current ? (
          <div className="border-primary border-2 text-black">loading</div>
        ) : (
          // Render the album details if not loading
          <div className="p-16 space-x-2 flex xl:flex-row flex-col justify-between border-primary border-2 text-black">
            {/* Album info section */}
            <div className="border-primary flex flex-col items-center lg:justify-start justify-between border-2 p-4">
              <h1 className="text-3xl mb-16 font-bold">
                Artist: {resultsRef.current[0].album.artist},<br />
                Title: {resultsRef.current[0].album.name}
              </h1>
              <img src={cover} alt="cover" />
              <button
                  onClick={addToLibrary}
                  className="enabled:hover:ring-4 justify-center items-center flex bg-primary w-8 h-8 rounded-xl disabled:opacity-60"
                  disabled={addedToLibRef.current === true ? true : false}
                >
                  {addedToLibRef.current === true ? (
                    alreadyInLibRef.current === true ? (
                      <BiErrorCircle />
                    ) : (
                      <BiCheckCircle />
                    )
                  ) : (
                    <BiPlusCircle />
                  )}
                </button>
            </div>
            <div className="border-primary w-4/5 border-2 p-4">
              {/* Album wiki and track listing */}
              <div className="border-primary border-2 p-4">
                {results.wiki ? results.wiki.content : ""}
              </div>
              <div className="border-primary border-2 p-4">
                <ol>
                  <h2 className="text-xl font-semibold mb-8">Track listing</h2>
                  {/* Dynamic rendering of track list based on the album type */}
                  {resultsRef.current[0].album.tracks?.track.length ? (
                    resultsRef.current[0].album.tracks.track.map(
                      (result: { url: string | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; duration: number; }, index: number) => {
                        // Mapping through each track and displaying its details
                        return (
                          <li
                            className="flex flex-row justify-between"
                            key={index}
                          >
                            <div>
                              {index + 1}.{" "}
                              <a href={result.url}>{result.name}</a>
                            </div>
                            <div className="w/1/5">
                              RUNTIME: {Math.floor(result.duration / 60)}:
                              {result.duration % 60 < 10
                                ? `0${result.duration % 60}`
                                : result.duration % 60}{" "}
                            </div>
                          </li>
                        );
                      }
                    )
                  ) : (
                    // Fallback for single track or no tracks
                    <li className="flex flex-row justify-between">
                      <div>
                        1.{" "}
                        <a
                          href={
                            resultsRef.current[0].album.tracks
                              ? resultsRef.current[0].album.tracks.track.url
                              : resultsRef.current[0].album.url
                          }
                        >
                          {resultsRef.current[0].album.tracks
                            ? resultsRef.current[0].album.tracks.track.name
                            : resultsRef.current[0].album.name}
                        </a>
                      </div>
                      {resultsRef.current[0].album &&
                      resultsRef.current[0].album.tracks ? (
                        // Displaying runtime if available
                        <div className="w/1/5">
                          RUNTIME:{" "}
                          {Math.floor(
                            resultsRef.current[0].album.tracks.track.duration / 60
                          )}
                          :
                          {resultsRef.current[0].album.tracks.track.duration % 60 <
                          10
                            ? `0${
                                resultsRef.current[0].album.tracks.track.duration %
                                60
                              }`
                            : resultsRef.current[0].album.tracks.track.duration %
                              60}
                        </div>
                      ) : null}
                    </li>
                  )}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetails;
