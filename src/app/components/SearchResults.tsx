"use client";
import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import useState from "react-usestateref";
import { BiCheckCircle, BiPlusCircle, BiErrorCircle } from "react-icons/bi";
import Header from "./Header";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "../utils/supabaseClient";
import SearchModal from "./SearchModal";
import extractDataFromCookie from "../utils/extractCookie";
import toast from "react-hot-toast";

// Define a SearchResult component
const SearchResult = ({ result, userId }) => {
  // State management for modal and library status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false);
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false);

  // Function to open the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
    console.log("opened");
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Function to add an item to the user's library
  const addToLibrary = async () => {
    // Fire toast notification if no user logged in
    if (userId === "") {
      toast.error("Log in to add to Library");
      console.log("no user");
      return; // This will exit the addToLibrary function
    }
    // Check if the item is already in the user's library
    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId);

    let isInUserLibrary = false;
    if (existingItem) {
      console.log("check library");
      // Filter to check if the item is already in the library
      const filtered = existingItem.filter(
        (item) => item.item_id === result.id
      );
      if (filtered.length > 0) {
        isInUserLibrary = true;
        setAddedToLib(true);
        setAlreadyInLib(true);
        console.log("already in library");
        toast.error("Already in Library!")
      }
    } else if (existingItemError) {
      console.log(existingItemError);
    }

    // If the item is not in the library, add it
    if (isInUserLibrary === false) {
      console.log("adding to library");
      console.log(result.id);
      setAddedToLib(true);
      // Insert the item into the user's library
      const { error } = await supabase.from("library").insert({
        item_id: result.id,
        user_id: userId,
      });
      if (error) {
        console.log(error);
      } else {
        toast.success("Added to Library!")
      }
    }
  };

  // Function to get button style based on the item type
  const getButtonStyle = (type: string) => {
    // Returns specific styles for different item types
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

  // Function to get image style based on the item type
  const getImgStyle = (type: string) => {
    // Returns specific styles for different item types
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

  // Render a button with the item, a button to add to library, and a search modal
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
      <div className="w-[20%]"><SearchModal
        result={result}
        show={isModalOpen}
        onBlur={handleCloseModal}
        onClose={handleCloseModal}
      /></div>
      
    </div>
  );
};

const SearchResults = () => {
  // State management for search results, loading status, and other variables
  const [results, setResults, resultsRef] = useState([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(false);
  const [category, setCategory, categoryRef] = useState("Your Library");
  const [userId, setUserId, userIdRef] = useState("");
  const [page, setPage, pageRef] = useState(0 | Number); // Initialize page number
  const [endOfResults, setEndofResults, endOfResultsRef] = useState(false); // To track if there are more results to load
  const router = useRouter(); // useRouter hook for navigation
  const [IGDBTwitchBearer, setIGDBTwitchBearer, IGDBTwitchBearerRef] =
    useState(""); // State for bearer token (not used in this part)
  const params = useSearchParams(); // Get search parameters
  const [term, setTerm, termRef] = useState(
    useSearchParams().get("term") || "bungus"
  ); // Search term state

  // Function to clear database tables (for administrative purposes)
  const clearItems = async () => {
    try {
      // Truncate library, books, and items tables in the database
      let { error: error1 } = await supabase.rpc("truncate_library");
      let { error: error2 } = await supabase.rpc("truncate_details");
      let { error: error3 } = await supabase.rpc("truncate_items");

      // Log errors if any occur during the truncation process
      if (error1 || error2 || error3) {
        console.error("Error clearing items: ", error1, error2, error3);
      }
    } catch (error) {
      console.error("Unexpected error: ", error);
    }
  };

  // Function to reset the results state to an empty array
  const wipeResults = async () => {
    setResults([]);
    console.log("wiping results");
  };

  // Callback function for handling book category selection
  const handleBooksClick = useCallback(async () => {
    setPage(1); // Reset the page number
    setIsLoading(true); // Set loading to true
    setResults([]); // Clear current results
    setEndofResults(false); // Reset end of results state
    setCategory("Books"); // Set the category to 'Books'
    console.log(categoryRef.current); // Log the current category for debugging
    console.log(isLoadingRef.current); // Log the loading status for debugging
    fetchBooks(); // Call function to fetch books
  }, [term, category]); // Dependencies of the useCallback

  // Function to fetch books based on the search term and page number
  const fetchBooks = useCallback(async () => {
    // Check if the end of results has not been reached
    if (endOfResultsRef.current === false) {
      try {
        // Make a POST request to fetch books
        const response = await fetch("/search/routes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            term: termRef.current, // Use current search term
            page: pageRef.current, // Use current page number
            type: "book", // Specify type as 'book'
          }),
        });
        const data = await response.json(); // Parse the response JSON
        console.log(data); // Log the data for debugging

        // Check if items are returned in the response
        if (data[0].items !== false) {
          console.log(data); // Log the data for debugging
          setResults((prevResults: any[]) => {
            // Filter out duplicate items and append new data
            const uniqueData = data.filter(
              (d) => !prevResults.some((p) => p.api_id === d.api_id)
            );
            return [...prevResults, ...uniqueData]; // Update the results state
          });
          setIsLoading(false); // Set loading to false
        } else {
          setEndofResults(true); // Set end of results to true if no more items
          setIsLoading(false); // Set loading to false
        }
      } catch (error) {
        console.error("Error fetching data: ", error); // Log any errors
        setIsLoading(false); // Set loading to false in case of error
      }
    }
  }, []); // No dependencies in useCallback

  // Functions related to handling album category
  const handleMusicClick = useCallback(() => {
    setPage(1); // Reset the page number
    setResults([]); // Clear current results
    setIsLoading(true); // Indicate that loading is in progress
    setEndofResults(false); // Reset end of results state
    setCategory("Albums"); // Set the current category to 'Albums'
    console.log(categoryRef.current); // Log the current category for debugging
    console.log(isLoadingRef.current); // Log the loading status for debugging
    fetchAlbums(); // Call the function to fetch albums
  }, [term, category]); // Dependencies for useCallback

  // Function to fetch album data
  const fetchAlbums = useCallback(async () => {
    try {
      // Make a POST request to fetch albums
      const results = await fetch("search/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: termRef.current, // Use the current search term
          page: pageRef.current, // Use the current page number
          type: "album", // Specify type as 'album'
        }),
      });
      const data = await results.json(); // Parse the response JSON
      // Check if items are returned in the response
      if (data[0].items === false) {
        setEndofResults(true); // Set end of results to true if no more items
        setIsLoading(false); // Set loading to false
      } else {
        console.log(data); // Log the data for debugging
        setResults((prevResults: any[]) => {
          // Filter out duplicate items and append new data
          const uniqueData = data.filter(
            (d) => !prevResults.some((p) => p.id === d.id)
          );
          return [...prevResults, ...uniqueData]; // Update the results state
        });
        setIsLoading(false); // Set loading to false
      }
    } catch (error) {
      console.error("Error fetching data: ", error); // Log any errors
      setIsLoading(false); // Set loading to false in case of error
    }
  }, [term]); // Dependencies for useCallback

  // Functions related to handling video category
  const handleVideoClick = useCallback(() => {
    setPage(1); // Reset the page number
    setResults([]); // Clear current results
    setIsLoading(true); // Indicate that loading is in progress
    setEndofResults(false); // Reset end of results state
    setCategory("Videos"); // Set the current category to 'Videos'
    console.log(categoryRef.current); // Log the current category for debugging
    console.log(isLoadingRef.current); // Log the loading status for debugging
    fetchVideos(); // Call the function to fetch videos
  }, [term, category]); // Dependencies for useCallback

  // Function to fetch video data
  const fetchVideos = useCallback(async () => {
    // Construct the URL for the video data API
    const url = `https://api.themoviedb.org/3/search/multi?query=${termRef.current}&include_adult=false&language=en-US&page=${pageRef.current}`;
    console.log(
      "TMDB API call:",
      isLoadingRef.current,
      "page",
      pageRef.current,
      "URL",
      url
    );

    // Make a POST request to fetch videos
    const results = await fetch("search/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        term: termRef.current, // Use the current search term
        page: pageRef.current, // Use the current page number
        type: "video", // Specify type as 'video'
      }),
    });
    const data = await results.json(); // Parse the response JSON
    console.log(data);
    // Check if items are returned in the response
    if (data[0].items === false) {
      setIsLoading(false); // Set loading to false
      setEndofResults(true); // Set end of results to true if no more items
    } else {
      console.log(data); // Log the data for debugging
      setResults((prevResults: any[]) => {
        // Filter out duplicate items and append new data
        const uniqueData = data.filter(
          (d) => !prevResults.some((p) => p.id === d.id)
        );
        return [...prevResults, ...uniqueData]; // Update the results state
      });
      setIsLoading(false); // Set loading to false
    }
  }, [term]); // Dependencies for useCallback

  // Functions related to handling game category
  const fetchGames = useCallback(async () => {
    try {
      console.log("server call");
      // Make a POST request to fetch games
      const res = await fetch("http://localhost:3000/search/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: termRef.current, // Use the current search term
          page: pageRef.current, // Use the current page number
          type: "game", // Specify type as 'game'
        }),
      });

      if (!res.ok) {
        console.error("Error fetching games:", res.status, res.statusText);
        return;
      }

      const data = await res.json(); // Parse the response JSON
      console.log(data); // Log the data for debugging
      if (data[0].items === false) {
        setIsLoading(false); // Set loading to false
        setEndofResults(true); // Set end of results to true if no more items
      } else {
        console.log(data); // Log the data for debugging
        setResults((prevResults: any[]) => {
          // Filter out duplicate items and append new data
          const uniqueData = data.filter(
            (d) => !prevResults.some((p) => p.id === d.id)
          );
          return [...prevResults, ...uniqueData]; // Update the results state
        });
        setIsLoading(false); // Set loading to false
      }
    } catch (error) {
      console.error("An error fetching games:", error); // Log any errors
    }
  }, [term]); // Dependencies for useCallback

  const handleGamesClick = useCallback(async () => {
    setPage(1); // Reset the page number
    setResults([]); // Clear current results
    setIsLoading(true); // Indicate that loading is in progress
    setEndofResults(false); // Reset end of results state
    setCategory("Games"); // Set the current category to 'Games'
    console.log(categoryRef.current); // Log the current category for debugging
    console.log(isLoadingRef.current); // Log the loading status for debugging
    fetchGames(); // Call the function to fetch games
    console.log("games fetched");
  }, [term, category]); // Dependencies for useCallback

  // Function to fetch library results
  const fetchLibraryResults = useCallback(async () => {
    setCategory("Your Library"); // Set current category to 'Your Library'
    setEndofResults(false); // Reset end of results state
    console.log(categoryRef.current + ":"); // Log the current category for debugging
    setResults([]); // Clear current results
    console.log(resultsRef); // Log results reference for debugging
    // Fetch items from Supabase with text search
    let { data, error } = await supabase
      .from("items")
      .select("*")
      .textSearch("title", `${termRef.current.trim().split(" ").join("&")}`);
    if (error) {
      console.log("Error fetching data: ", error); // Log any errors
      setResults([]); // Clear results in case of error
    } else setResults(data); // Set fetched data as results
    setIsLoading(false); // Set loading to false
  }, [category, term]); // Dependencies for useCallback

  // Custom debounce hook
  const useDebounce = (func, delay) => {
    const callback = useRef(func); // useRef to store the function

    useEffect(() => {
      callback.current = func; // Update the current function
    }, [func]); // Dependency on function

    return useCallback(
      (...args) => {
        const currentCallback = callback.current;
        clearTimeout(callback.current.timer); // Clear previous timer
        callback.current.timer = setTimeout(() => {
          currentCallback(...args); // Call function after delay
        }, delay);
      },
      [delay] // Dependency on delay
    );
  };

  // Function to handle infinite scrolling
  const handleScroll = useCallback(() => {
    // Check if the user has scrolled to near the bottom of the page
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      endOfResultsRef.current === false
    ) {
      console.log("should load new page");
      // Fetch more results based on the current category
      if (categoryRef.current === "Books" && !isLoading) {
        setPage(page + 1);
        setIsLoading(true); // Prevent additional fetches during loading
        fetchBooks();
      }
      if (categoryRef.current === "Albums" && !isLoading) {
        setPage(page + 1);
        setIsLoading(true); // Prevent additional fetches during loading
        fetchAlbums();
      }
      if (categoryRef.current === "Videos" && !isLoading) {
        setPage(page + 1);
        setIsLoading(true); // Prevent additional fetches during loading
        fetchVideos();
      }
      if (categoryRef.current === "Games" && !isLoading) {
        setPage(page + 1);
        setIsLoading(true); // Prevent additional fetches during loading
        fetchGames();
      }
    }
  }, [category, isLoading]); // Dependencies for useCallback

  // Create a debounced version of handleScroll
  const debouncedHandleScroll = useDebounce(handleScroll, 500);

  // useEffect hook to extract user data from cookies
  useEffect(() => {
    // Extract user data from cookies
    const data = extractDataFromCookie();
    if (data) {
      setUserId(data.userId); // Set user ID from extracted data
    } else {
      console.log("auth_data not found in cookie");
      setUserId(""); // Clear user ID if auth data not found
    }
  }, []);

  // useEffect hook for handling scroll events
  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll); // Add scroll event listener
    return () => window.removeEventListener("scroll", debouncedHandleScroll); // Cleanup on unmount
  }, [debouncedHandleScroll]);
  const termCheck = useSearchParams().get("term")
  // useEffect hook for handling search term changes
  useEffect(() => {
    wipeResults(); // Clear current results
    const newTerm = params.get("term") || "bungus"; // Get new search term
    if (termRef.current !== newTerm) {
      console.log("changed term");
      setTerm(newTerm); // Update term state if it has changed
    }
  }, [termCheck]);

  // useEffect hook to initialize component based on search term
  useEffect(() => {
    if (userIdRef.current !== "") {
      setCategory("Your Library"); // Set initial category
      setPage(0); // Set initial page number
      console.log("component did mount, search query:", term);
      if (term && categoryRef.current === "Your Library") {
        setIsLoading(true); // Set loading state
        fetchLibraryResults(); // Fetch results from library
      }
    } else {
      console.log("user not logged in, please select category");
    }
  }, [termRef.current, setResults]); // Dependencies for useEffect

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
          {userIdRef.current !== "" ? (
            <button
              onClick={fetchLibraryResults}
              className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:outline-none focus:ring-4"
            >
              Your Library
            </button>
          ) : null}
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

        {userIdRef.current === "" && categoryRef.current === "Your Library" ? (
          <div className="flex justify-center mt-8">
            user not logged in. Please select media format to search through or
            log in to search library.
          </div>
        ) : (
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
        )}

        {endOfResultsRef.current === true ? (
          resultsRef.current.length === 0 ? (
            <div>
              <div className="flex justify-center mt-8">
                No results found. Try a different search term or choose a
                different media format.
              </div>
            </div>
          ) : (
            <div>
              <div className="w-full border-black h-2 border-t-4 mt-4"></div>
              <div className="flex justify-center mt-8">
                End of results reached.
              </div>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default SearchResults;
