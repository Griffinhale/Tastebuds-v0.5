"use client";

import { useEffect } from "react";
import useState from "react-usestateref";
import Library from "../components/library/Library";
import Header from "../components/common/Header";
import AlbumDetails from "../components/details/AlbumDetails";
import BookDetails from "../components/details/BookDetails";
import GameDetails from "../components/details/GameDetails";
import VideoDetails from "../components/details/VideoDetails";
import supabase from "../utils/supabaseClient";

const RandomPage = () => {
  const [isLoaded, setIsLoaded, isLoadedRef] = useState(false);
  const [results, setResult, resultsRef] = useState<any>(null);
  const [refresh, setRefresh, refreshRef] = useState(false);
  const [params, setParams, paramsRef] = useState<any>([]);

  const Loading = () => {
    return <p>Loading...</p>;
  };

  const getComponent = (type: string) => {
    const components: { [key: string]: React.FC<any> } = {
      book: BookDetails,
      video: VideoDetails,
      game: GameDetails,
      album: AlbumDetails,
    };

    const Component = components[type] || Loading;
    return <Component params={paramsRef.current} />;
  };

  const getRandomItem = async () => {
    const { data, error } = await supabase
      .from("random_items")
      .select("*")
      .limit(1)
      .single();
    console.log(data);
    return data;
  };

  const handleRefresh = async () => {
    setRefresh(true);
    const results = await getRandomItem();
    setResult(results);
    setParams([resultsRef.current.type, resultsRef.current.id]);
  };

  

  useEffect(() => {
    const setup = async () => {
      const results = await getRandomItem();
      setResult(results);
      setParams([results.type, results.id]);
      setIsLoaded(true);
    };
    if (!isLoadedRef.current) {
      setup();
      setRefresh(false);
    }
  }, [isLoadedRef, setIsLoaded, setParams, setRefresh, setResult]);

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      <Header />
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <button className="text-black bg-primary rounded-xl p-4 mb-8" onClick={handleRefresh}>
          Get a new taste <br/> {/* Add keyword buttons to add subtle filtering to the randomizer, think the splice sampler UI */}
        </button>
        {resultsRef.current ? getComponent(resultsRef.current.type) : <Loading />}
      </div>
    </div>
  );
};

export default RandomPage;