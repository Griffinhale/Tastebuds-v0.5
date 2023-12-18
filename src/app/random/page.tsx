"use client";

import { useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
import useState from "react-usestateref";
import Library from "../components/Library";
import Header from "../components/Header";
import AlbumDetails from "../components/AlbumDetails";
import BookDetails from "../components/BookDetails";
import GameDetails from "../components/GameDetails";
import VideoDetails from "../components/VideoDetails";
import supabase from "../utils/supabaseClient";
import { get } from "http";

const Home = () => {
  const [isLoaded, setIsLoaded, isLoadedRef] = useState(false);
  const [results, setResult, resultsRef] = useState<any>({
    type: "bungus",
  });
  const [refresh, setRefresh, refreshRef] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [params, setParams, paramsRef] = useState<any>([]);
  const Loading = () => {
    return <p>Loading...</p>;
  };

  async function getRandomItem() {
    const { data, error } = await supabase
      .from("random_items")
      .select("*")
      .limit(1)
      .single();
    console.log(data);
    return data;
  }

  async function handleRefresh() {
    setRefresh(true);
    const results = await getRandomItem();
    setResult(results);
    setParams([resultsRef.current.type, resultsRef.current.id]);
  }

  function getComponent(type: string) {
    switch (type) {
      case "book":
        return <BookDetails params={paramsRef.current} />;
      case "video":
        return <VideoDetails params={paramsRef.current} />;
      case "game":
        return <GameDetails params={paramsRef.current} />;
      case "album":
        return <AlbumDetails params={paramsRef.current} />;
      default:
        return <Loading />;
    }
  }

  async function setup() {
    const results = await getRandomItem();
    setResult(results);

    setParams([results.type, results.id]);
  }

  useEffect(() => {
    if (resultsRef.current.type === "bungus") {
      setup().then(() => {
        setIsLoaded(true);
      });
      setRefresh(false);
    } 
  }, []);
  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      <Header />
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <button className="text-black bg-primary rounded-xl p-4 mb-8" onClick={handleRefresh}>
          Get a new taste <br/> {/*add keyword buttons to add subtle filtering to the randomizer, think the splice sampler UI*/}
        </button>
        {getComponent(paramsRef.current[0])}
      </div>
    </div>
  );
};

export default Home;
