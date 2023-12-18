"use client";
import { useEffect } from "react";
import useState from "react-usestateref";
import SearchModal from "./SearchModal";
import Header from "./Header";
import supabase from "../utils/supabaseClient";
import extractDataFromCookie from "../utils/extractCookie";

// Define a component to display an item in a library
const LibraryItem = ({ result }) => {
  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen, isModalOpenRef] = useState(false);
  
  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    console.log("closed modal");
  };

  // Function to open the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
    console.log("opened");
  };

  // Function to get button style based on the type of item
  const getButtonStyle = (type) => {
    // Return specific styles for different item types
    if (type === "book") {
      return "items-center justify-center h-80 flex flex-col  mx-2 px-2 hover:ring-4 rounded-full relative bg-red-500/30";
    } else if (type === "album") {
      return "items-center justify-center h-80 flex flex-col mx-2 px-2  hover:ring-4 rounded-full relative bg-green-500/30";
    } else if (type === "video") {
      return "items-center justify-center h-80 flex flex-col mx-2 px-2  hover:ring-4 rounded-full relative bg-blue-500/30";
    } else if (type === "game") {
      return "items-center justify-center h-80 flex flex-col mx-2 px-2  hover:ring-4 rounded-full relative bg-slate-500/30";
    }
  };

  // Function to get image style based on the type of item
  const getImgStyle = (type) => {
    // Return specific styles for different item types
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

  // Render a button for each item, with modal to show more details
  return (
    <div className="py-4">
      <button
        onClick={handleOpenModal}
        className={getButtonStyle(result.items.type)}
      >
        <div className="flex-col flex space-y-4 justify-center items-center">
          <img
            className={getImgStyle(result.items.type)}
            src={result.items ? result.items.cover : ""}
            alt="cover"
          />
          <h1 className="bg-secondary/70  rounded-xl text-white py-4">
            {result.items ? result.items.title : ""}
          </h1>
        </div>
      </button>
      <SearchModal
        className="w-[20%]"
        result={result.items}
        show={isModalOpenRef.current}
        onBlur={handleCloseModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

// Define a component to display a library of items
const Library = () => {
  // State for storing library items and user ID
  const [results, setResults, resultsRef] = useState([]);
  const [userId, setUserId, userIdRef] = useState("");

  // Function to fetch library data from the database
  async function getLib(user_id) {
    const { data, error } = await supabase
      .from("library")
      .select("user_id, item_id, items(*)")
      .eq("user_id", user_id);
    console.log("library: ", data);
    if (data === null) {
      return [];
    }
    setResults(data);
    return data;
  }

  // useEffect hook to load data when the component mounts
  useEffect(() => {
    // Extract user data from cookies
    const data = extractDataFromCookie();
    if (data) {
      console.log("UserId:", data.userId);
      console.log("ScreenName:", data.screenName);
      // Fetch library data for the user
      const lib = getLib(data.userId);
      setUserId(data.userId);
    } else {
      console.log("auth_data not found in cookie");
      setUserId("");
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount
  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      {/*Header*/}
      <Header />

      {/*Main Content*/}
      <div className="bg-primary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <div className="border-b-2 h-auto border-primary rounded-xl">
          <div className="flex-row flex">
            <h1 className="font-bold text-xl pb-4 ml-4">Library</h1>
          </div>
        </div>

        {/*Sections Bar*/}
        <div className="inline-flex justify-between h-32 w-full border-primary border-b-2 px-12">
          <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
            Books
          </button>
          <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
            Movies
          </button>
          <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
            Music
          </button>
          <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
            Games
          </button>
          <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
            All
          </button>
        </div>

        {/*Sections Content*/}
        <div>
          {/*Pinned Content*/}
          {/*TODO: ADD PINNED COMMENT FUNCTIONALITY*/}
          <div className="justify-between flex px-12 py-4 border-b-2 border-primary">
            <button className="rounded-xl hover:ring-4">
              <div className="flex-col flex justify-center items-center">
                <div className="w-32 h-32 rounded-full bg-slate-500"></div>
                <h1 className="pt-4">Title</h1>
              </div>
            </button>
            <button className="rounded-xl hover:ring-4">
              <div className="flex-col flex justify-center items-center">
                <div className="w-32 h-32 rounded-full bg-slate-500"></div>
                <h1 className="pt-4">Title</h1>
              </div>
            </button>
            <button className="rounded-xl hover:ring-4">
              <div className="flex-col flex justify-center items-center">
                <div className="w-32 h-32 rounded-full bg-slate-500"></div>
                <h1 className="pt-4">Title</h1>
              </div>
            </button>
            <button className="rounded-xl hover:ring-4">
              <div className="flex-col flex justify-center items-center">
                <div className="w-32 h-32 rounded-full bg-slate-500"></div>
                <h1 className="pt-4">Title</h1>
              </div>
            </button>
            <button className="rounded-xl hover:ring-4">
              <div className="flex-col flex justify-center items-center">
                <div className="w-32 h-32 rounded-full bg-slate-500"></div>
                <h1 className="pt-4">Title</h1>
              </div>
            </button>
          </div>

          {/*Infinite Content*/}
          <div className="">
            <div className="w-full flex focus:drop-shadow-none focus:ring-offset-0 justify-end mt-8">
              <select>
                <option>Alphabetical</option>
                <option>Most Recent</option>
                <option>Highest User Rating</option>
              </select>
            </div>
            <div className="grid space-x-4 grid-cols-5 py-4">
              {resultsRef.current.length > 0 ? (
                resultsRef.current.map((result, index) => {
                  return (
                    <LibraryItem key={result.id || index} result={result} />
                  );
                })
              ) : (
                <p>isloading</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
