"use client";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useEffect, useRef } from "react";
import useState from "react-usestateref";
import { useRouter } from "next/navigation";
import { BsDot, BsThreeDots, BsChat } from "react-icons/bs";
import { AiOutlineRetweet, AiOutlineHeart } from "react-icons/ai";
import { IoStatsChart, IoShareOutline } from "react-icons/io5";
import { LuLibrary, LuHome, LuSearch } from "react-icons/lu";
import { IoListSharp } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { MdForum } from "react-icons/md";
import extractDataFromCookie from "../utils/extractCookie";

const LeftSidebar = () => {
  
  const [isClicked, setIsClicked] = useState(false); // State for tracking if search button currently clicked
  const [showIcon, setShowIcon] = useState(true); // State for controlling visibility of search icon
  const [searchTerm, setSearchTerm] = useState(""); // State for holding search term
  const [userId, setUserId, userIdRef] = useState("");
  const inputRef = useRef<HTMLInputElement>(null); // useRef hook to create a reference for the input field

  // useRouter hook from Next.js to handle routing
  const router = useRouter();

  // Function to reset the search field
  const resetSearchField = () => {
    setSearchTerm(""); 
    setIsClicked(false); 
    setShowIcon(true); 
    inputRef.current!.blur(); // Remove focus from the input field
  };

  // Function to handle the submission of the search form
  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault(); 
    router.push(`/search?term=${encodeURIComponent(searchTerm)}`); 

    resetSearchField(); // Reset the search field after submitting
  };

  // Function to handle random media selection
  const handleRandomClick = () => {
    console.log("random"); // Log 'random' to the console for debugging
    router.replace("/random"); // Use router.replace to navigate to the random page without adding the navigation to the history stack
  }

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
  });
  return (
    <div className="flex text-black">
      <div className="sticky w-[300px] h-screen top-[0px] py-12">
        <div className="text-primary ml-28 mb-10  text-6xl">
          <MdForum />
        </div>
        <section className="border-primary border-t-8 flex-grow text-black text-xl rounded-xl bg-quartiary/80 w-full flex flex-col">
          <div className="m-4 ml-12 pt-8">
            <div
              onClick={() => {
                if (!isClicked) {
                  setIsClicked(true);
                  setShowIcon(false);
                  inputRef.current!.focus();
                }
              }}
              className={`flex items-center justify-center w-[80%] my-6 mt-0 h-12 relative transition-all duration-500 ease-in-out ${
                isClicked ? "w-[100%]" : "w-12"
              }`}
            >
              <form onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={isClicked ? "Search" : ""}
                  onFocus={() => {
                    setIsClicked(true);
                    setShowIcon(false);
                  }}
                  onBlur={() => {
                    setIsClicked(false);
                    setTimeout(() => {
                      setShowIcon(true);
                      
                    }, 400); // delay the state update
                  }}
                  className={`bg-primary outline-none border-none py-[0.88rem] text-sm rounded-full hover:ring-4 ${
                    isClicked ? "w-[100%] px-3" : "w-12 px-1"
                  }`}
                  style={{ textIndent: isClicked ? "1rem" : "0" }}
                />
              </form>
              {!isClicked && showIcon && (
                <LuSearch className="absolute left-100" />
              )}
            </div>
            <div className="m-4 mt-8 -ml-4 text-2xl pb-20 space-y-6 border-s-2 border-primary">
              <div>
                <Link href="/">
                  <button className="flex space-x-4 hover:bg-tertiary/30 hover:pr-24 transition-all ease-in-out hover:duration-350 rounded-full px-4 py-2">
                    <div className="pt-0.5 pr-2">
                      <LuHome />
                    </div>
                    Home
                  </button>
                </Link>
              </div>
              { userIdRef.current === "" ? null :
              (<div>
                <Link href="/library">
                  <button className="flex space-x-4 hover:bg-tertiary/30 hover:pr-20 transition-all ease-in-out hover:duration-350 rounded-full px-4 py-2">
                    <div className="pt-0.5 pr-2">
                      <LuLibrary />
                    </div>
                    Library
                  </button>
                </Link>
              </div>)
              }
              <div>
                <Link href="/random">
                  <button onClick={handleRandomClick} className="flex space-x-4 hover:bg-tertiary/30 hover:pr-8 transition-all ease-in-out hover:duration-350 rounded-full px-4 py-2">
                    <div className="pt-0.5 pr-2">
                      <FaUserFriends />
                    </div>
                    Clover
                  </button>
                </Link>
              </div>
              <div>
                <Link href="/">
                  <button className="flex space-x-4 hover:bg-tertiary/30 hover:pr-28 transition-all ease-in-out hover:duration-350 rounded-full px-4 py-2">
                    <div className="pt-0.5 pr-2">
                      <IoListSharp />
                    </div>
                    Lists
                  </button>
                </Link>
              </div>
              
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeftSidebar;
