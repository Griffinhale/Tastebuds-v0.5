/* eslint-disable @next/next/no-img-element */
"use client";
import {
  JSXElementConstructor,
  Key,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
} from "react";
import useState from "react-usestateref";
import supabase from "../../utils/supabaseClient";
import extractDataFromCookie from "../../utils/extractCookie";
import DetailsCoverCard from "./DetailsCoverCard";

interface Params {
  params: [string, string];
}

// Component for displaying details of a video
const VideoDetails: React.FC<Params> = ({ params }) => {
  // State management for video details, loading status, library status, etc.
  const [results, setResults, resultsRef] = useState<any>([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(true);
  const [cover, setCover] = useState("");
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

  // Fetch video details on component mount
  useEffect(() => {
    // Function to fetch video details
    async function getVideoDetails(item_id: string) {
      // Fetch video details from the database
      const { data: videoDetails, error: videoDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      setCover(videoDetails![0].cover); // Set cover image

      // Prepare data for additional details fetch
      const bodyData = {
        type: params[0],
        api_id: videoDetails![0].api_id,
        video_type: videoDetails![0].video_type,
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
      data.video_type = videoDetails![0].video_type;
      if (data.credits && !data.creator) {
        data.creator = data.credits.crew.l
          ? data.credits.crew[0].name
          : "Unknown";
      } else {
        data.creator = "Unknown";
      }
      setResults(data); // Set the results state
      setIsLoading(false); // Set loading to false
    }
    getVideoDetails(params[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]); // Rerun this effect when params state changes

  if (resultsRef.current.video_type === "tv") {
    return (
      <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
        {/*Main Content*/}
        <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
          {/*Info*/}
          {isLoadingRef.current ? (
            <div className="text-black">loading</div>
          ) : (
            <div className="p-16 space-x-2 flex 2xl:flex-row flex-col justify-between border-primary text-black">
              <DetailsCoverCard
                userId={userIdRef.current}
                id={resultsRef.current.id}
                title={resultsRef.current.title}
                cover={cover}
                creator={resultsRef.current.creator}
              />
              <div className="w-4/5 p-4">
                <p className="whitespace-pre-line">
                  {resultsRef.current.overview}
                </p>
              </div>
              <div className="flex-col flex justify-between w-4/5 p-4">
                <div>
                  <p>
                    Number of seasons: {resultsRef.current.number_of_seasons}
                  </p>
                  <p>
                    Number of Episodes: {resultsRef.current.number_of_episodes}
                  </p>
                  <p>First Air Date: {resultsRef.current.first_air_date}</p>
                  <p>
                    Created by:{" "}
                    {resultsRef.current.created_by.length !== 0
                      ? resultsRef.current.created_by[0].name
                      : null}
                  </p>
                </div>
                <div>
                  <h2>Genres:</h2>
                  {resultsRef.current.genres ? (
                    resultsRef.current.genres.map(
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
        <div className="bg-quartiary/80 border-primary border-t-8 px-8 py-8 mt-1 rounded-xl text-black">
          {/*Info*/}
          {isLoadingRef.current ? (
            <div className="text-black">loading</div>
          ) : (
            <div className="p-16 space-x-2 flex 2xl:flex-row flex-col justify-between text-black">
              <DetailsCoverCard
                userId={userIdRef.current}
                id={resultsRef.current.id}
                title={resultsRef.current.title}
                cover={cover}
                creator={resultsRef.current.creator}
              />
              <div className=" w-4/5 p-4">
                <p className="whitespace-pre-line">
                  {resultsRef.current.overview}
                </p>
              </div>
              <div className="flex-col flex justify-between w-4/5 p-4">
                <div>
                  <p>Budget: {resultsRef.current.budget}</p>
                  <p>Revenue: {resultsRef.current.revenue}</p>
                  <p>Release Date: {resultsRef.current.release_date}</p>
                  <p></p>
                </div>
                <div>
                  <h2>Genres:</h2>
                  {resultsRef.current.genres ? (
                    resultsRef.current.genres.map(
                      (genre: any, index: number) => {
                        return <p key={index}>{genre.name}</p>;
                      }
                    )
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
  return <div>?</div>;
};

export default VideoDetails;
