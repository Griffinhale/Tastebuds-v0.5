"use client";
import React, { useEffect } from "react";
import Header from "../common/Header";
import LibrarySectionsBar from "./LibrarySectionsBar";
import PinnedContent from "../common/PinnedContent";
import SortingSelector from "../common/SortSelector";
import LibraryItemList from "./LibraryItemList";
import { useLibrary } from "../../contexts/LibraryContext"; // Import useLibrary from LibraryContext
import { useUser } from "../../contexts/UserContext"; // Import useUser from UserContext

// Define a component to display a library of items
const Library = () => {
  const { libraryItems, fetchLibraryItems } = useLibrary(); // Use the context to fetch library items
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchLibraryItems();
    }
  }, [user, fetchLibraryItems]);

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      <Header />
      <div className="bg-primary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <div className="border-b-2 h-auto border-primary rounded-xl">
          <div className="flex-row flex">
            <h1 className="font-bold text-xl pb-4 ml-4">Library</h1>
          </div>
        </div>
        <LibrarySectionsBar />
        <PinnedContent />
        <SortingSelector />
        <LibraryItemList results={libraryItems} />
      </div>
    </div>
  );
};

export default Library;