import React from 'react';
import Image from "next/image";

const SearchResultCard = ({ id, title, type, cover, onOpenModal }: { id: string, title: string, type: string, cover: string, onOpenModal: () => void }) => {
  const getButtonStyle = (type: string) => {
    switch (type) {
      case "book":
        return "items-center justify-center w-full h-80 flex flex-col hover:ring-4 rounded-full relative bg-red-500/30";
      case "album":
        return "items-center justify-center w-full h-80 flex flex-col hover:ring-4 rounded-full relative bg-green-500/30";
      case "video":
        return "items-center justify-center w-full h-80 flex flex-col hover:ring-4 rounded-full relative bg-blue-500/30";
      case "game":
        return "items-center justify-center w-full h-80 flex flex-col hover:ring-4 rounded-full relative bg-slate-500/30";
      default:
        return "";
    }
  };

  const getImgStyle = (type: string) => {
    switch (type) {
      case "book":
      case "video":
      case "game":
        return "w-45 h-60 rounded-xl overflow-hidden";
      case "album":
        return "w-60 h-60 rounded-xl overflow-hidden";
      default:
        return "";
    }
  };

  return (
    <button onClick={onOpenModal} className={getButtonStyle(type)}>
      <div>
        <Image className={getImgStyle(type)} layout="fill" src={cover} alt={title} />
      </div>
      <h2>{title}</h2>
    </button>
  );
};

export default SearchResultCard;