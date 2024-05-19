"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import useState from "react-usestateref";
import SearchModal from "../search/SearchModal";
import { useLibrary } from "../../contexts/LibraryContext"; // Import useLibrary from LibraryContext
import { useExpandedItemDetails } from "../../contexts/ExpandedItemDetailsContext"; // Import useExpandedItemDetails from context

const LibraryItem = ({ result }: any) => {
  const [isModalOpen, setIsModalOpen, isModalOpenRef] = useState(false);
  const { addItemToLibrary, removeItemFromLibrary } = useLibrary(); // Use the context to add/remove items
  const { setItemDetails, clearItemDetails } = useExpandedItemDetails(); // Use the context to set item details

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearItemDetails();
    console.log("closed modal");
  };

  const handleOpenModal = () => {
    setItemDetails(result.items); // Set item details in context
    setIsModalOpen(true);
    console.log("opened");
  };

  const getButtonStyle = (type: string) => {
    switch (type) {
      case "book":
        return "items-center justify-center h-80 w-60 flex flex-col mx-2 px-2 hover:ring-4 rounded-lg relative bg-red-500/30";
      case "album":
        return "items-center justify-center h-80 w-60 flex flex-col mx-2 px-2 hover:ring-4 rounded-lg relative bg-green-500/30";
      case "video":
        return "items-center justify-center h-80 w-60 flex flex-col mx-2 px-2 hover:ring-4 rounded-lg relative bg-blue-500/30";
      case "game":
        return "items-center justify-center h-80 w-60 flex flex-col mx-2 px-2 hover:ring-4 rounded-lg relative bg-slate-500/30";
      default:
        return "items-center justify-center h-80 w-60 flex flex-col mx-2 px-2 hover:ring-4 rounded-lg relative bg-gray-500/30";
    }
  };

  return (
    <div className="py-4">
      <button onClick={handleOpenModal} className={getButtonStyle(result.items.type)}>
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <div className="relative w-full h-full overflow-hidden rounded-lg transition-transform duration-300 ease-in-out group hover:overflow-visible">
            <Image
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              layout="fill"
              src={result.items.cover}
              alt="cover"
            />
          </div>
        </div>
        <h1 className="bg-secondary/70 rounded-xl text-white py-4 mt-4">
          {result.items.title}
        </h1>
      </button>
      <div className="w-[20%]">
        <SearchModal
          result={result}
          show={isModalOpenRef.current}
          onBlur={handleCloseModal}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default LibraryItem;