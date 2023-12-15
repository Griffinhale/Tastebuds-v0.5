"use client";
import { useEffect } from "react";
import useState from "react-usestateref";
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi";
import supabase from "../utils/supabaseClient";
import extractDataFromCookie from "../utils/extractCookie";
import toast from "react-hot-toast"

// Component for displaying details of a video
const VideoDetails = ({ params }: { params: [string] }) => {
  // State management for video details, loading status, library status, etc.
  const [results, setResults, resultsRef] = useState([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(true);
  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false);
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false);
  const [cover, setCover] = useState("");
  const [userId, setUserId, userIdRef] = useState("");

  // Function to add a video to the user's library
  const addToLibrary = async () => {
    // Fire toast notification if no user logged in
    if (userId === "") {
      toast.error("Log in to add to Library");
      console.log("no user");
      return; // This will exit the addToLibrary function
    }
    // Check if the video is already in the user's library
    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userIdRef.current);

    let isInUserLibrary = false;
    if (existingItem) {
      console.log("check library");
      // Filter to check if the video is already in the library
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

    // If the video is not in the library, add it
    if (isInUserLibrary === false) {
      console.log("adding to library");
      console.log(params[1]);
      setAddedToLib(true);
      // Insert the video into the user's library
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

  // useEffect hook to load video details on component mount
  useEffect(() => {
    // Extract user data from cookie
    const data = extractDataFromCookie();
    if (data) {
      console.log("UserId:", data.userId);
      console.log("ScreenName:", data.screenName);
      setUserId(data.userId);
    } else {
      console.log("auth_data not found in cookie");
      setUserId("");
    }

    // Function to fetch video details
    async function getVideoDetails(item_id: string) {
      // Fetch video details from the database
      const { data: videoDetails, error: videoDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      console.log(videoDetails[0]);
      setCover(videoDetails[0].cover); // Set cover image

      // Prepare data for additional details fetch
      const bodyData = {
        type: params[0],
        api_id: videoDetails[0].api_id,
        video_type: videoDetails[0].video_type,
      };
      // Fetch additional details
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
      let data = await response.json();
      data.video_type = videoDetails[0].video_type;
      setResults(data); // Set the results state
      setIsLoading(false); // Set loading to false
      console.log(resultsRef.current); // Log the results for debugging
    }
    console.log(params); // Log params for debugging
    getVideoDetails(params[1]); // Call the function to get video details
  }, []); // Empty dependency array ensures this effect runs only once on mount

  if (resultsRef.current.video_type === "tv") {
    return (
      <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
        {/*Main Content*/}
        <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
          {/*Info*/}
          {isLoadingRef.current ? (
            <div className="border-primary border-2 text-black">loading</div>
          ) : (
            <div className="p-16 space-x-2 flex xl:flex-row flex-col justify-between border-primary border-2 text-black">
              <div className="border-primary flex flex-col items-center lg:justify-start justify-between border-2 p-4">
                <h1 className="text-3xl font-bold">
                  {resultsRef.current.name}
                </h1>
                <h2 className="mb-8">{resultsRef.current.tagline}</h2>

                <a href={resultsRef.current.homepage}>
                  <img src={cover} alt="cover" />
                </a>
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
                <p className="whitespace-pre-line">
                  {resultsRef.current.overview}
                </p>
              </div>
              <div className="border-primary flex-col flex justify-between w-4/5 border-2 p-4">
                <div>
                  <p>Number of seasons: {resultsRef.current.number_of_seasons}</p>
                  <p>Number of Episodes: {resultsRef.current.number_of_episodes}</p>
                  <p>First Air Date: {resultsRef.current.first_air_date}</p>
                  <p>Created by: {resultsRef.current.created_by.length !== 0?resultsRef.current.created_by[0].name:null}</p>
                </div>
                <div>
                  <h2>Genres:</h2>
                  {resultsRef.current.genres ? (
                    resultsRef.current.genres.map((genre, index) => {
                      return <p key={index}>{genre.name}</p>;
                    })
                  ) : (
                    <p>None Available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  if (resultsRef.current.video_type === "movie") {
    return (
      <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
        {/*Main Content*/}
        <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
          {/*Info*/}
          {isLoadingRef.current ? (
            <div className="border-primary border-2 text-black">loading</div>
          ) : (
            <div className="p-16 space-x-2 flex xl:flex-row flex-col justify-between border-primary border-2 text-black">
              <div className="border-primary flex flex-col items-center lg:justify-start justify-between border-2 p-4">
                <h1 className="text-3xl font-bold">
                  {resultsRef.current.title}
                </h1>
                <h2 className="mb-8">{resultsRef.current.tagline}</h2>

                <a href={resultsRef.current.homepage}>
                  <img src={cover} alt="cover" />
                </a>
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
                <p className="whitespace-pre-line">
                  {resultsRef.current.overview}
                </p>
              </div>
              <div className="border-primary flex-col flex justify-between w-4/5 border-2 p-4">
                <div>
                  <p>Budget: {resultsRef.current.budget}</p>
                  <p>Revenue: {resultsRef.current.revenue}</p>
                  <p>Release Date: {resultsRef.current.release_date}</p>
                  <p></p>
                </div>
                <div>
                  <h2>Genres:</h2>
                  {resultsRef.current.genres ? (
                    resultsRef.current.genres.map((genre, index) => {
                      return <p key={index}>{genre.name}</p>;
                    })
                  ) : (
                    <p>None Available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } 
  return <div>?</div>
};

export default VideoDetails;
