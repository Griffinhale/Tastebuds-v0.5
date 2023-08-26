"use client";
import { useEffect, useRef, useCallback } from "react";
import Link from "next/link"
import useState from "react-usestateref";
import axios from "axios";
import { BiCheckCircle, BiPlusCircle, BiErrorCircle } from "react-icons/bi";
import Header from "./Header";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "../utils/supabaseClient";
import SearchModal from "./SearchModal";

const SearchResult = ({ result, userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false);
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false);
  
  

  const handleOpenModal = () => {
    setIsModalOpen(true);
    console.log("opened");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const addToLibrary = async () => {
    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId);
    let isInUserLibrary = false;
    if (existingItem) {
      console.log("check library");
      const filtered = existingItem.filter(
        (item) => item.item_id === result.id
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
      console.log(result.id);
      setAddedToLib(true);
      const { error } = await supabase.from("library").insert({
        item_id: result.id,
        user_id: userId,
      });
      if (error) {
        console.log(error);
      }
    }
  };

  const getButtonStyle = (type) => {
    if (type === "book") {
      return "items-center justify-center w-full h-80 flex flex-col hover:ring-4 rounded-full relative bg-red-500/30";
    } else if (type === "album") {
      return "items-center justify-center w-full h-80 flex flex-col hover:ring-4 rounded-full relative bg-green-500/30";
    } else if (type === "video") {
      return "items-center justify-center w-full h-80 flex flex-col hover:ring-4 rounded-full relative bg-blue-500/30";
    } else if (type === "game") {
      return "items-center justify-center w-full h-80 flex flex-col hover:ring-4 rounded-full relative bg-slate-500/30";
    }
  };

  const getImgStyle = (type) => {
    if (type === "book") {
      return "w-45 h-60 rounded-xl overflow-hidden";
    } else if (type === "album") {
      return "w-60 h-60 rounded-xl overflow-hidden";
    } else if (type === "video") {
      return "w-45 h-60 rounded-xl overflow-hidden";
    } else if (type === "game") {
      return "w-45 h-60 rounded-xl overflow-hidden";
    }
  };


  return (
    <div className="py-4">
      <button onClick={handleOpenModal} className={getButtonStyle(result.type)}>
        <div>
          <img className={getImgStyle(result.type)} src={result.cover} />
        </div>
        <h2>{result.title}</h2>
      </button>
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
      
      <SearchModal
        className="w-[20%]"
        result={result}
        show={isModalOpen}
        onBlur={handleCloseModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

const SearchResults = () => {
  const [results, setResults, resultsRef] = useState([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(false);
  const [category, setCategory, categoryRef] = useState("Your Library");
  const [userId, setUserId, userIdRef] = useState("");
  const [page, setPage, pageRef] = useState(0 | Number);
  const [endOfResults, setEndofResults, endOfResultsRef] = useState(false);
  const router = useRouter();
  const [IGDBTwitchBearer, setIGDBTwitchBearer, IGDBTwitchBearerRef] =
    useState("");
  const params = useSearchParams();
  const [term, setTerm, termRef] = useState(
    useSearchParams().get("term") || "bungus"
  );

  //clear db
  const clearItems = async () => {
    try {
        // Truncate library table
        let { error: error1 } = await supabase.rpc('truncate_library');

        // Truncate books table
        let { error: error2 } = await supabase.rpc('truncate_details');

        // Truncate items table for books
        let { error: error3 } = await supabase.rpc('truncate_items');

        if (error1 || error2 || error3) {
            console.error("Error clearing items: ", error1, error2, error3);
        }
    } catch (error) {
        console.error("Unexpected error: ", error);
    }
};

  //resets results state to blank array
  const wipeResults = async () => {
    setResults([]);
    console.log("wiping results");
  };

  //book functions
  const handleBooksClick = useCallback(async () => {
    setIsLoading(true);
    setResults([]);
    setEndofResults(false);
    setCategory("Books");
    console.log(categoryRef.current);
    console.log(isLoadingRef.current);
    fetchBooks();
  }, [term, category]);

  const fetchBooks = useCallback(async () => {
    if (endOfResultsRef.current === false) {
      try {
        const response = await fetch("/search/routes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            term: termRef.current,
            page: pageRef.current,
            type: "book",
          }),
        });
        const data = await response.json();
        console.log(data);
        
        if (data[0].items !== false) {
          console.log(data);
          setResults((prevResults: any[]) => {
            const uniqueData = data.filter(
              (d) => !prevResults.some((p) => p.api_id === d.api_id)
            );
            return [...prevResults, ...uniqueData];
          });
          setIsLoading(false);
        } else {
          setEndofResults(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setIsLoading(false);
      }
    }
  }, []);

  //album functions
  const handleMusicClick = useCallback(() => {
    setPage(1);
    setResults([]);
    setIsLoading(true);
    setEndofResults(false);
    setCategory("Albums");
    console.log(categoryRef.current);
    console.log(isLoadingRef.current);
    fetchAlbums();
  }, [term, category]);

  const fetchAlbums = useCallback(async () => {
      
    try {
      const results = await fetch('search/routes', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: termRef.current,
          page: pageRef.current,
          type: "album",
        }),
      });
      const data = await results.json();
      if (data[0].items === false) {
        setEndofResults(true);
        setIsLoading(false);
      
      } else {
        console.log(data);
      setResults((prevResults: any[]) => {
        const uniqueData = data.filter(
          (d) => !prevResults.some((p) => p.id === d.id)
        );
        return [...prevResults, ...uniqueData];
      });
      setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      setIsLoading(false);
    }
  }, [term]);

  //video functions
  const handleVideoClick = useCallback(() => {
    setPage(1);
    setResults([]);
    setIsLoading(true);
    setEndofResults(false);
    setCategory("Videos");
    console.log(categoryRef.current);
    console.log(isLoadingRef.current);
    fetchVideos();
  }, [term, category]);

  const fetchVideos = useCallback(async () => {
    const url = `https://api.themoviedb.org/3/search/multi?query=${termRef.current}&include_adult=false&language=en-US&page=${pageRef.current}`;
    console.log(
      "TMDB API call:",
      isLoadingRef.current,
      "page",
      pageRef.current,
      "URL",
      `https://api.themoviedb.org/3/search/multi?query=${termRef.current}&include_adult=false&language=en-US&page=${pageRef.current}`
    );
      
    const results = await fetch('search/routes', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        term: termRef.current,
        page: pageRef.current,
        type: "video",
      }),
    });
    const data = await results.json();
    if(data[0].items === false) {
      setIsLoading(false);
      setEndofResults(true);
    } else {
      console.log(data);
    setResults((prevResults: any[]) => {
      const uniqueData = data.filter(
        (d) => !prevResults.some((p) => p.id === d.id)
      );
      return [...prevResults, ...uniqueData];
    });
    setIsLoading(false);
    }
    
  }, [term]);



  //games functions
  const fetchGames = useCallback(async () => {
    try {
      console.log("server call");
      const res = await fetch("http://localhost:3000/search/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: termRef.current,
          page: pageRef.current, 
          type: "game",
        }),
      });

      if (!res.ok) {
        console.error("Error fetching games:", res.status, res.statusText);
        return;
      }

      const data = await res.json();
      console.log(data);
      setResults(data);
      setIsLoading(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [term]);

  const handleGamesClick = useCallback(async () => {
    setPage(1);
    setResults([]);
    setIsLoading(true);
    setEndofResults(false);
    setCategory("Games");
    console.log(categoryRef.current);
    console.log(isLoadingRef.current);
    fetchGames();
    console.log("games fetched");
  }, [term, category, fetchGames]);

  //library results
  const fetchLibraryResults = useCallback(async () => {
    setCategory("Your Library");
    setEndofResults(false);
    console.log(categoryRef.current + ":");
    setResults([]);
    console.log(resultsRef);
    let { data, error } = await supabase
      .from("items")
      .select("*")
      .textSearch("title", `${termRef.current.trim().split(" ").join("&")}`);
    if (error) {
      console.log("Error fetching data: ", error);
      setResults([]);
    } else setResults(data);
    setIsLoading(false);
  }, [category, term]);

  //scroll stuff

  const useDebounce = (func, delay) => {
    const callback = useRef(func);

    useEffect(() => {
      callback.current = func;
    }, [func]);

    return useCallback(
      (...args) => {
        const currentCallback = callback.current;
        clearTimeout(callback.current.timer);
        callback.current.timer = setTimeout(() => {
          currentCallback(...args);
        }, delay);
      },
      [delay]
    );
  };

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      endOfResultsRef.current === false
    ) {
      console.log("should load new page");
      if (categoryRef.current === "Books" && !isLoading) {
        setPage(page + 1);
        setIsLoading(true); // Add a condition to prevent the fetch when API request is still going
        fetchBooks();
      }
      if (categoryRef.current === "Albums" && !isLoading) {
        setPage(page + 1);
        setIsLoading(true);// Add a condition to prevent the fetch when API request is still going
        fetchAlbums();
      }
      if (categoryRef.current === "Videos" && !isLoading) {
        setPage(page + 1);
        setIsLoading(true); // Add a condition to prevent the fetch when API request is still going
        fetchVideos();
      }
    }
  }, [category, isLoading]); // Add isLoading as dependency

  const debouncedHandleScroll = useDebounce(handleScroll, 500);

  550;

  useEffect(() => {
    function extractDataFromCookie() {
      // Get the entire cookie string
      const cookieString = document.cookie;

      // Extract the auth_data value from the cookie string
      const authDataMatch = cookieString.match(/auth_data=([^;]+)/);
      if (!authDataMatch) return null;

      // Decode the URI component to get the JSON string
      const authDataJSON = decodeURIComponent(authDataMatch[1]);

      // Parse the JSON string to get the object
      const authDataObj = JSON.parse(authDataJSON);

      // Extract the userId and screenName properties
      const userId = authDataObj.userId;
      const screenName = authDataObj.screenName;

      return { userId, screenName };
    }
    

    const data = extractDataFromCookie();
    if (data) {
      setUserId(data.userId);
    } else {
      console.log("auth_data not found in cookie");
      setUserId("");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  useEffect(() => {
    // Get the new search parameter
    wipeResults();
    const newTerm = params.get("term") || "bungus";
    // Update the state variable
    if (termRef.current !== newTerm) {
      console.log("changed term");
      setTerm(newTerm);
    }
  }, [useSearchParams().get("term")]);

  useEffect(() => {
    setCategory("Your Library");
    setPage(0);
    console.log("component did mount, search query:", term);
    if (term && categoryRef.current === "Your Library") {
      setIsLoading(true);
      fetchLibraryResults();
    }
  }, [termRef.current, setResults]);

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      {/*Header*/}
      <Header />
      {/*Main Content*/}
      <div className="bg-primary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <div className="border-b-2 h-auto border-primary rounded-xl">
          <div className="flex-row flex">
            <h1 className="font-bold text-xl pb-4 ml-4">
              Results for &quot;{term}&quot;
            </h1>
          </div>
        </div>
        {/*Sections Bar*/}
        <div className="inline-flex justify-between h-32 w-full border-primary border-b-2 px-12">
          <button
            onClick={fetchLibraryResults}
            className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:outline-none focus:ring-4"
          >
            Your Library
          </button>
          <button
            onClick={handleBooksClick}
            className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:ring-4"
          >
            Books
          </button>
          <button
            onClick={handleVideoClick}
            className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:ring-4"
          >
            Movies
          </button>
          <button
            onClick={handleMusicClick}
            className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:ring-4"
          >
            Music
          </button>
          <button
            onClick={handleGamesClick}
            className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:ring-4"
          >
            Games
          </button>
        </div>
        {/*Results*/}
        
          <div className="relative grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 4xl:grid-cols-8 3xl:grid-cols-6 xl:grid-cols-5 py-8 space-x-4 mx-4">
            {resultsRef.current.map((result, index) => {
              return (
                <SearchResult
                  key={result.id || index}
                  result={result}
                  userId={userIdRef.current}
                />
              );
            })}
          </div>
        
      </div>
    </div>
  );
};

export default SearchResults;
