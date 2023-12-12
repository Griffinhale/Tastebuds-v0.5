"use client";
import { useEffect } from "react";
import useState from "react-usestateref";
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi";
import supabase from "../utils/supabaseClient";
import extractDataFromCookie from "../utils/extractCookie";

// Define a component to display game details
const GameDetails = ({ params }: { params: [string] }) => {
  // useStateRef is used to create state variables along with references to them
  const [results, setResults, resultsRef] = useState([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(true);
  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false);
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false);
  const [cover, setCover] = useState("");
  const [userId, setUserId, userIdRef] = useState("");

  // Function to add a game to the user's library
  const addToLibrary = async () => {
    // Check if the item is already in the user's library
    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userIdRef.current);

    let isInUserLibrary = false;

    // If the item exists, check if it matches the current game
    if (existingItem) {
      console.log("check library");
      const filtered = existingItem.filter(
        (item) => item.item_id === params[1]
      );

      // If the game is found, update state to reflect its presence
      if (filtered.length > 0) {
        isInUserLibrary = true;
        setAddedToLib(true);
        setAlreadyInLib(true);
        console.log("already in library");
      }
    } else if (error) {
      console.log(error);
    }

    // If the game is not in the library, add it
    if (isInUserLibrary === false) {
      console.log("adding to library");
      console.log(params[1]);
      setAddedToLib(true);

      // Insert the game into the library in the database
      const { error } = await supabase.from("library").insert({
        item_id: params[1],
        user_id: userId,
      });

      if (error) {
        console.log(error);
      }
    }
  };

  // useEffect hook to load game details on component mount
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

    // Function to fetch game details
    async function getGameDetails(item_id: string) {
      // Fetch details of the game from the database
      const { data: gameDetails, error: gameDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      console.log(gameDetails[0]);
      setCover(gameDetails[0].cover);

      // Prepare data for fetching additional details
      const bodyData = { type: params[0], api_id: gameDetails[0].api_id };

      // Make an API call to fetch additional details
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
      console.log(data);

      // Set the results and update loading state
      setResults(data[0]);
      setIsLoading(false);
      console.log(resultsRef.current);
      return data;
    }

    console.log(params);
    // Call the function to get game details
    getGameDetails(params[1]);
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      {/*Header*/}

      {/*Main Content*/}
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        {/*Info*/}
        {isLoadingRef.current ? (
          <div className="border-primary border-2 text-black">loading</div>
        ) : (
          <div className="p-16 space-x-2 flex xl:flex-row flex-col justify-between border-primary border-2 text-black">
            <div className="border-primary flex flex-col items-center lg:justify-start justify-between border-2 p-4">
              <h1 className="text-3xl font-bold">{resultsRef.current.name}</h1>

              <a href={resultsRef.current.url}>
                <img src={resultsRef.current.cover.url} alt="cover" />
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
                {resultsRef.current.summary}
              </p>
            </div>
            <div className="border-primary flex-col flex justify-between w-4/5 border-2 p-4">
              <div></div>
              <div>
                <h2>Genres:</h2>
                {resultsRef.current.genres
                  ? resultsRef.current.genres.map((genre, index) => {
                      return <p key={index}>{genre.name}</p>;
                    })
                  : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;
