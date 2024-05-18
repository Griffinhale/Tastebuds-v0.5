/*******************************
 * By Griffin Jack
 * Purpose: Component to display cover and title of a media item
 * Inputs:  item id, title, cover, creator, and subtitle, plus the userID if present
 *******************************/


import React, {useEffect, useCallback} from 'react';
import supabase from "../../utils/supabaseClient"; // Import supabase client for database interactions
import toast from "react-hot-toast";
import useState from "react-usestateref"; // Import custom useState hook that provides a ref to the state
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi"; // Import icons from react-icons library
import Image from 'next/image';

interface DetailsCoverCardProps {
    id: string;
    title: string;
    cover: string;
    creator: string;
    userId: string;
    subtitle?: string;
}

const DetailsCoverCard: React.FC<DetailsCoverCardProps> = ({id, title, cover, creator, userId, subtitle = ""}) => {
  console.log("userId:", userId); // Make sure this isn't an object unless expected
  console.log("id:", id); // Make sure this isn't an object unless expected
  console.log("title:", title); // Make sure this isn't an object unless expected
  console.log("cover:", cover); // Make sure this isn't an object unless expected
  console.log("creator:", creator); // Make sure this isn't an object unless expected
    const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false); // State to check if book is already in library
    const [addedToLib, setAddedToLib, addedToLibRef] = useState(false); // State to check if book was added to library
    const addToLibrary = async () => {
        // Fire toast notification if no user logged in
        if (userId === "") {
          toast.error("Log in to add to Library");
          console.log("no user");
          return; // This will exit the addToLibrary function
        }
    
        // Querying supabase to check if the book is already in the user's library
        const { data: existingItem, error: existingItemError } = await supabase
          .from("library")
          .select("*")
          .eq("user_id", userId);
        let isInUserLibrary = false;
        // Check if the book is already in the library
        if (existingItem) {
          console.log("in lib?");
          const filtered = existingItem.filter(
            (libItem) => libItem.item_id === id
          );
          if (filtered.length > 0) {
            isInUserLibrary = true;
            setAddedToLib(true);
            setAlreadyInLib(true);
            console.log("already in library");
            toast.error("Already in Library!");
          }
        } else if (existingItemError) {
          console.log(existingItemError);
        }
        // Add book to the library if it's not already there
        if (!isInUserLibrary) {
          setAddedToLib(true);
          console.log(id, userId);
          const { error } = await supabase.from("library").insert({
            item_id: id,
            user_id: userId,
          });
          if (error) {
            console.log(error);
          } else {
            toast.success("Added to Library!");
          }
        }
      };
    
    useEffect((() =>
        setAddedToLib(false))
   , [title, setAddedToLib]);
  
    return (
    <div className="bg-quartiary/90 rounded-xl flex flex-col lg:flex-row items-center lg:justify-start justify-between mt-6 mb-6 p-4 2xl:mt-96 2xl:mb-96 mr-6">
              <div className="flex-col w-3/5 ml-6 mr-6">
                <h1 className="text-3xl font-bold">
                    {title}
                </h1>
                <h2 className="italic text-xl">
                    {subtitle}
                </h2>
                <h2 className="text-lg">
                by{" "}{creator}
                </h2>
              </div>
              <div className="flex flex-col mr-8 h-500 w-500 mt-6 mb-6 items-center bg-secondary/20 rounded-2xl">
                <a href={""}>
                    <Image
                    src={cover}
                    alt="cover"
                    width={400}
                    height={400}
                    className = "p-8"
                    />
                </a>
                <button
                    onClick={addToLibrary}
                    className="enabled:hover:ring-4 justify-center items-center flex bg-primary w-8 h-8 rounded-xl disabled:opacity-60 mb-8"
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
              </div>
            </div>
  )
}

export default DetailsCoverCard;