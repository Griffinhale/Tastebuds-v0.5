"use client";
import { usePathname } from "next/navigation";
import Header from "../../../components/common/Header";
import Library from "../../../components/library/Library";
import AlbumDetails from "../../../components/details/AlbumDetails";
import BookDetails from "@/app/components/details/BookDetails";
import GameDetails from "@/app/components/details/GameDetails";
import VideoDetails from "@/app/components/details/VideoDetails";

const DetailPage = () => {
  const pathname = usePathname();
  const params = pathname.split("/").slice(2);

  const detailComponents: { [key: string]: React.FC<any> } = {
    book: BookDetails,
    video: VideoDetails,
    game: GameDetails,
    album: AlbumDetails,
  };

  const PageComponent = detailComponents[params[0]] || Library;

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      <Header />
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <PageComponent params={params} />
      </div>
    </div>
  );
};

export default DetailPage;