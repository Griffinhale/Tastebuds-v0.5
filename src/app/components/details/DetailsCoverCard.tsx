import React, { useEffect, useCallback } from 'react';
import supabase from "../../utils/supabaseClient";
import toast from "react-hot-toast";
import useState from "react-usestateref";
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi";
import Image from 'next/image';
import { useUser } from "../../contexts/UserContext";
import { useExpandedItemDetails } from "../../contexts/ExpandedItemDetailsContext";

const DetailsCoverCard: React.FC = () => {
  const { user } = useUser();
  const { itemDetails, setItemDetails, clearItemDetails } = useExpandedItemDetails();

  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false);
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false);

  const addToLibrary = async () => {
    if (user.id === "guest") {
      toast.error("Log in to add to Library");
      console.log("no user");
      return;
    }

    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", user.id);

    let isInUserLibrary = false;
    if (existingItem) {
      const filtered = existingItem.filter(
        (libItem) => libItem.item_id === itemDetails.id
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

    if (!isInUserLibrary) {
      setAddedToLib(true);
      const { error } = await supabase.from("library").insert({
        item_id: itemDetails.id,
        user_id: user.id,
      });
      if (error) {
        console.log(error);
      } else {
        toast.success("Added to Library!");
      }
    }
  };

  useEffect(() => {
    setAddedToLib(false);
  }, [itemDetails, setAddedToLib]);

  if (!itemDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-quartiary/90 rounded-xl flex flex-col lg:flex-row items-center lg:justify-start justify-between mt-6 mb-6 p-4 2xl:mt-96 2xl:mb-96 mr-6">
      <div className="flex-col w-3/5 ml-6 mr-6">
        <h1 className="text-3xl font-bold">{itemDetails.title}</h1>
        <h2 className="italic text-xl">{itemDetails.subtitle}</h2>
        <h2 className="text-lg">by {itemDetails.creator}</h2>
      </div>
      <div className="flex flex-col mr-8 h-500 w-500 mt-6 mb-6 items-center bg-secondary/20 rounded-2xl">
        <a href={""}>
          <Image src={itemDetails.cover} alt="cover" width={400} height={400} className="p-8" />
        </a>
        <button
          onClick={addToLibrary}
          className="enabled:hover:ring-4 justify-center items-center flex bg-primary w-8 h-8 rounded-xl disabled:opacity-60 mb-8"
          disabled={addedToLibRef.current === true}
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
  );
};

export default DetailsCoverCard;