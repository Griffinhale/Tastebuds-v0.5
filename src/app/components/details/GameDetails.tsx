/* eslint-disable @next/next/no-img-element */
"use client";
import {JSXElementConstructor,Key,PromiseLikeOfReactNode,ReactElement,ReactNode,ReactPortal,useEffect} from "react";
import useState from "react-usestateref";
import supabase from "../../utils/supabaseClient";
import extractDataFromCookie from "../../utils/extractCookie";
import DetailsCoverCard from "./DetailsCoverCard";

interface Params {
  params: [string, string];
}

// Define a component to display game details
const GameDetails: React.FC<Params> = ({ params }) => {
  // useStateRef is used to create state variables along with references to them
  const [results, setResults, resultsRef] = useState<any>([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(true);
  const [cover, setCover, coverRef] = useState("");
  const [userId, setUserId, userIdRef] = useState("");

  // Extract user data from cookie
  useEffect(() => {
    const data = extractDataFromCookie();
    if (data) {
      setUserId(data.userId);
    } else {
      console.log("auth_data not found in cookie");
      setUserId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch further game details on component mount
  useEffect(() => {
    async function getGameDetails(item_id: string) {
      // Fetch details of the game from the database
      const { data: gameDetails, error: gameDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      setCover(gameDetails![0].cover);

      // Prepare data for fetching additional details
      const bodyData = { type: params[0], api_id: gameDetails![0].api_id };

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

      // Set the results and update loading state
      data[0].cover = "http:" + coverRef.current;
      console.log(data[0].cover)
      data[0].title = data[0].name;
      data[0].api_id = data[0].id;
      data[0].id = params[1];
      if (data[0].companyData.length == 0) {
        data[0].creator = "Unknown";
      } else {
        data[0].creator = data[0].companyData[0].name;
      }

      setResults(data[0]);
      console.log(userIdRef.current, resultsRef.current);
      setIsLoading(false);
      return data;
    }
    getGameDetails(params[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      {/*Header*/}

      {/*Main Content*/}
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        {/*Info*/}
        {isLoadingRef.current ? (
          <div className="text-black">loading</div>
        ) : (
          <div className="p-16 space-x-2 flex 2xl:flex-row flex-col justify-between text-black">
            <DetailsCoverCard userId={userIdRef.current} id={resultsRef.current.id} title={resultsRef.current.title} cover={resultsRef.current.cover} creator={resultsRef.current.creator}/>
            <div className="w-4/5 p-4">
              <p className="whitespace-pre-line">
                {resultsRef.current.summary}
              </p>
            </div>
            <div className="flex-col flex justify-between w-4/5 p-4">
              <div></div>
              <div>
                <h2>Genres:</h2>
                {resultsRef.current.genres
                  ? resultsRef.current.genres.map(
                      (
                        genre: {
                          name:
                            | string
                            | number
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | PromiseLikeOfReactNode
                            | null
                            | undefined;
                        },
                        index: Key | null | undefined
                      ) => {
                        return <p key={index}>{genre.name}</p>;
                      }
                    )
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
