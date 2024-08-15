import React, { useEffect, useState } from 'react';
import { BiCheckCircle, BiPlusCircle, BiErrorCircle } from "react-icons/bi";
import { useUser } from "../../contexts/UserContext";
import supabase from "../../utils/supabaseClient";
import toast from "react-hot-toast";

type AddToLibraryButtonProps = {
  itemId: string;
};

const AddToLibraryButton = ({ itemId }: AddToLibraryButtonProps) => {
  const { user } = useUser();
  const [addedToLib, setAddedToLib] = useState(false);
  const [alreadyInLib, setAlreadyInLib] = useState(false);

  useEffect(() => {
    const checkIfInLibrary = async () => {
      if (!user) return;
      const { data: existingItem } = await supabase
        .from("library")
        .select("*")
        .eq("user_id", user.id)
        .eq("item_id", itemId);

      const isInLibrary = existingItem && existingItem.length > 0;
      setAlreadyInLib(isInLibrary!);
      setAddedToLib(isInLibrary!);
    };

    checkIfInLibrary();
  }, [user, itemId]);

  const handleAddToLibrary = async () => {
    if (!user) {
      toast.error("Log in to add to Library");
      return;
    }

    if (!alreadyInLib) {
      const { error } = await supabase.from("library").insert({
        item_id: itemId,
        user_id: user.id,
      });

      if (error) {
        console.log(error);
      } else {
        setAddedToLib(true);
        setAlreadyInLib(true);
        toast.success("Added to Library!");
      }
    } else {
      toast.error("Already in Library!");
    }
  };

  return (
    <button
      onClick={handleAddToLibrary}
      className="enabled:hover:ring-4 justify-center items-center flex bg-primary w-8 h-8 rounded-xl disabled:opacity-60"
      disabled={addedToLib}
    >
      {addedToLib ? (
        alreadyInLib ? (
          <BiErrorCircle />
        ) : (
          <BiCheckCircle />
        )
      ) : (
        <BiPlusCircle />
      )}
    </button>
  );
};

export default AddToLibraryButton;