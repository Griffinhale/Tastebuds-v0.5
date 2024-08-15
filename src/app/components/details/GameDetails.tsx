/* eslint-disable @next/next/no-img-element */
"use client";
import {JSXElementConstructor,Key,PromiseLikeOfReactNode,ReactElement,ReactNode,ReactPortal,useEffect} from "react";
import useState from "react-usestateref";
import supabase from "../../utils/supabaseClient";
import {useUser} from "../../contexts/UserContext";
import DetailsCoverCard from "./DetailsCoverCard";
import { useExpandedItemDetails } from "../../contexts/ExpandedItemDetailsContext";
import DetailsDescriptionCard from "./DetailsDescriptionCard";


interface Params {
  params: [string, string];
}

// Define a component to display game details
const GameDetails: React.FC<Params> = ({ params }) => {
  // useStateRef is used to create state variables along with references to them
  const [results, setResults, resultsRef] = useState<any>([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(true);
  const [cover, setCover, coverRef] = useState("");
  const {user} = useUser();
  const { itemDetails, setItemDetails, clearItemDetails } = useExpandedItemDetails();



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

      // Format results (should be on server)
      data[0].cover = coverRef.current;
      console.log(data[0].cover)
      data[0].title = data[0].name;
      data[0].api_id = data[0].id;
      data[0].id = params[1];
      data[0].type = params[0];
      data[0].description = data[0].summary || "";
      if (data[0].companyData.length == 0) {
        data[0].creator = "Unknown";
      } else {
        data[0].creator = data[0].companyData[0].name;
      }

      // Update State
      setResults(data[0]);
      setItemDetails(data[0]);
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
            <DetailsCoverCard/>
            <div className="w-4/5 p-4">
              <DetailsDescriptionCard/>
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
