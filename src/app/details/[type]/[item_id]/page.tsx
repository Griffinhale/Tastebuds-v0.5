"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import HomePage from "../../../components/HomePage";
import Header from "../../../components/Header";
import Library from "../../../components/Library";
import { useSearchParams } from "next/navigation";
import SearchResults from "../../../components/SearchResults";
import AlbumDetails from "../../../components/AlbumDetails";
import BookDetails from "@/app/components/BookDetails";
import GameDetails from "@/app/components/GameDetails";
import VideoDetails from "@/app/components/VideoDetails";

const Home = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = pathname.split("/").slice(2);
  
  let PageComponent;

  switch (params[0]) {
    case "book":
      PageComponent = BookDetails;
      break;
    case "video":
      PageComponent = VideoDetails;
      break;
    case "game":
      PageComponent = GameDetails;
      break;
    case "album":
      PageComponent = AlbumDetails;
      break;
    default:
      PageComponent = Library;
      break;
  }

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      <Header />
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <PageComponent params={params} />
      </div>
    </div>
  )
};

export default Home;
