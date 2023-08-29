"use client";
import { useEffect } from "react";
import useState from "react-usestateref";
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi";
import supabase from "../utils/supabaseClient";
import extractDataFromCookie from "../utils/extractCookie";

const GameDetails = ({ params }: { params: [string] }) => {
  const [results, setResults, resultsRef] = useState([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(true);
  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false);
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false);
  const [cover, setCover] = useState("");
  const [userId, setUserId, userIdRef] = useState("");
  const addToLibrary = async () => {
    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userIdRef.current);
    let isInUserLibrary = false;
    if (existingItem) {
      console.log("check library");
      const filtered = existingItem.filter(
        (item) => item.item_id === params[1]
      );
      if (filtered.length > 0) {
        isInUserLibrary = true;
        setAddedToLib(true);
        setAlreadyInLib(true);
        console.log("already in library");
      }
    } else if (error) {
      console.log(error);
    }
    if (isInUserLibrary === false) {
      console.log("adding to library");
      console.log(params[1]);
      setAddedToLib(true);
      const { error } = await supabase.from("library").insert({
        item_id: params[1],
        user_id: userId,
      });
      if (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const data = extractDataFromCookie();

    setUserId(data.userId);

    async function getGameDetails(item_id: string) {
      const { data: gameDetails, error: gameDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      console.log(gameDetails[0]);
      setCover(gameDetails[0].cover);
      const bodyData = { type: params[0], api_id: gameDetails[0].api_id };
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
      setResults(data[0]);
      setIsLoading(false);
      console.log(resultsRef.current);
      return data;
    }
    console.log(params);
    getGameDetails(params[1]);
  }, []);
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
              <h1 className="text-3xl font-bold">
                {resultsRef.current.name}
              </h1>
              
              <a href={resultsRef.current.url}>
                <img
                  src={resultsRef.current.cover.url}
                  alt="cover"
                />
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
              <div>
              
              </div>
              <div>
                <h2>Genres:</h2>
              {resultsRef.current.genres?resultsRef.current.genres.map((genre, index) => {
                return <p key={index}>{genre.name}</p>
              }):null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameDetails