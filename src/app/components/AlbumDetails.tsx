/* eslint-disable @next/next/no-img-element */
// Use client-side rendering for this component
"use client";

// Import necessary hooks and utilities
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useEffect } from "react";
import useState from "react-usestateref";
import supabase from "../utils/supabaseClient"; // Importing Supabase client
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi";
import toast from "react-hot-toast";
import extractDataFromCookie from "../utils/extractCookie";
import DetailsCoverCard from "./DetailsCoverCard";
import DetailsDescriptionCard from "./DetailsDescriptionCard";


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
  const [cover, setCover, coverRef] = useState(""); // Stores album cover URL
  const [userId, setUserId, userIdRef] = useState(""); // State for storing user ID
  const [showDescription, setShowDescription, showDescriptionRef] = useState(false); //

  // A function to handle album type selection logic (currently empty)
  /*function selectAlbumType() {
    console.log();
    console.log(resultsRef.current[0].album);
    console.log(typeof resultsRef.current[0].album === "object");
  }*/

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
        data[0].creator = albumDetails![0].creator;
        data[0].title = albumDetails![0].title;
        data[0].cover = coverRef.current;
        if (data[0].album.wiki){
          setShowDescription(true);
        }
        setResults(data[0]);
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
      <div className="bg-quartiary/80 border-t-8 border-primary border-rounded px-8 py-8 mt-1 rounded-xl text-black">
        {/* Conditional rendering based on loading state */}
        {isLoadingRef.current ? (
          <div className="border-black border-rounded text-black">loading</div>
        ) : (
          // Render the album details if not loading
          <div className="p-16 space-x-2 flex 2xl:flex-row flex-col justify-between border-black rounded text-black">
            {/* Album info section */}
            <DetailsCoverCard userId={userIdRef.current} id={resultsRef.current.id} title={resultsRef.current.title} cover={resultsRef.current.cover} creator={resultsRef.current.creator} />
            {showDescriptionRef.current ? (
            <DetailsDescriptionCard description={resultsRef.current.album.wiki.summary}/>
            ) : null}
            <div className="border-black rounded w-4/5 p-4">
              {/* Album wiki and track listing */}
              <div className="border-black rounded p-4">
                <ol>
                  <h2 className="text-xl font-semibold mb-8">Track listing</h2>
                  {/* Dynamic rendering of track list based on the album type */}
                  {resultsRef.current.album.tracks?.track.length ? (
                    resultsRef.current.album.tracks.track.map(
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
                            resultsRef.current.album.tracks
                              ? resultsRef.current.album.tracks.track.url
                              : resultsRef.current.album.url
                          }
                        >
                          {resultsRef.current.album.tracks
                            ? resultsRef.current.album.tracks.track.name
                            : resultsRef.current.album.name}
                        </a>
                      </div>
                      {resultsRef.current.album &&
                      resultsRef.current.album.tracks ? (
                        // Displaying runtime if available
                        <div className="w/1/5">
                          RUNTIME:{" "}
                          {Math.floor(
                            resultsRef.current.album.tracks.track.duration / 60
                          )}
                          :
                          {resultsRef.current.album.tracks.track.duration % 60 <
                          10
                            ? `0${
                                resultsRef.current.album.tracks.track.duration %
                                60
                              }`
                            : resultsRef.current.album.tracks.track.duration %
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
