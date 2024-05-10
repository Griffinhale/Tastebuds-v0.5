import React, {useEffect} from 'react';
import supabase from "../utils/supabaseClient"; // Import supabase client for database interactions
import toast from "react-hot-toast";
import useState from "react-usestateref"; // Import custom useState hook that provides a ref to the state
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi"; // Import icons from react-icons library
import Image from 'next/image';

interface itemDetails {
    id: string;
    cover: string;
    title: string;
    creator: string;
    [key: string]: any;
}

interface DetailsCardProps {
    item: itemDetails;
    userId: string;
}

const DetailsCoverCard: React.FC<DetailsCardProps> = ({item, userId}) => {
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
          const filtered = existingItem.filter(
            (libItem) => libItem.item_id === item.id
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
          const { error } = await supabase.from("library").insert({
            item_id: item.id,
            user_id: userId,
          });
          if (error) {
            console.log(error);
          } else {
            toast.success("Added to Library!");
          }
        }
      };
    
    useEffect(() => {
        console.log("CoverCard Loaded");
        console.log(item);
    })
  
    return (
    <div className="bg-quartiary/90 rounded-xl flex flex-col lg:flex-row items-center lg:justify-start justify-between p-4">
              <div className="flex-col w-3/5">
                <h1 className="text-3xl font-bold">
                    {item.title}
                </h1>
                <h2 className="text-xl">
                    {item.subtitle?item.subtitle+", ":""} by{" "}
                    {item.creator}
                </h2>
              </div>
              <div className="flex flex-col items-center bg-secondary/20 rounded-2xl">
                <a href={item.previewLink}>
                    <Image
                    src={item.cover}
                    alt="cover"
                    width={300}
                    height={300}
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

export default DetailsCoverCard