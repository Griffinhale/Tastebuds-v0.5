"use client";
import { useEffect } from "react";
import useState from "react-usestateref";
import supabase from "../utils/supabaseClient";
import Header from "./Header";

const AlbumDetails = ({ params }: { params: { itemId: string } }) => {
  const [results, setResults, resultsRef] = useState([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(true);
  const [cover, setCover] = useState("");

  function selectAlbumType() {
    console.log();
    console.log(resultsRef.current.album);
    console.log(typeof resultsRef.current.album === "object");
  }

  useEffect(() => {
    async function getAlbumDetails(item_id: string) {
      const { data: albumDetails, error: albumDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      console.log(albumDetails[0].creator, albumDetails[0].title);
      const artist = albumDetails[0].creator;
      const album = albumDetails[0].title;
      setCover(albumDetails[0].cover);
      const bodyData = { type: params[0], artist: artist, album: album };
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
      setResults(data);
      setIsLoading(false);
      console.log(resultsRef.current.album.artist);
      return data;
    }
    console.log(params);
    getAlbumDetails(params[1]);
    selectAlbumType();
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
              <h1 className="text-3xl mb-16 font-bold">
                Artist: {resultsRef.current.album.artist},<br />
                Title: {resultsRef.current.album.name}
              </h1>
              <img src={cover} alt="cover" />
            </div>
            <div className="border-primary w-4/5 border-2 p-4">
              <div className="border-primary border-2 p-4">
                {results.wiki ? results.wiki.content : ""}
              </div>
              <div className="border-primary border-2 p-4">
                <ol>
                  <h2 className="text-xl font-semibold mb-8">Track listing</h2>
                  {/*TODO: ADD STATE THAT CHANGES BASED OFF IF ALBUM IS SINGLE OR MULTIPLE TRACKS OR NO TRACKS LISTED TO RENDER CORRECT DETAILS*/}
                  {resultsRef.current.album.tracks?.track.length ? (
                    resultsRef.current.album.tracks.track.map(
                      (result, index) => {
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
