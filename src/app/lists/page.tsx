"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "@/app/components/Header";
import ListBrowser from "../components/lists/ListBrowser";

const Home = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params: any = pathname.split("/").slice(2);
  
  let PageComponent;

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      <Header />
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <ListBrowser />
      </div>
    </div>
  )
};

export default Home;
