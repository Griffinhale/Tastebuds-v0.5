"use client";
import React, { useEffect } from "react";
import useState from "react-usestateref";
import { useRouter } from "next/navigation";
import { LuLibrary, LuHome, LuSearch } from "react-icons/lu";
import { IoListSharp } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { MdForum } from "react-icons/md";
import SearchInput from "./SearchInput";
import SidebarLink from "./SidebarLink";
import {useUser} from "../../contexts/UserContext";

const LeftSidebar = () => {
  const {user} = useUser();
  const router = useRouter();


  const handleSearch = (term: string) => {
    router.push(`/search?term=${encodeURIComponent(term)}`);
  };

  const handleRandomClick = () => {
    router.replace("/random");
  };

  return (
    <div className="flex text-black">
      <div className="sticky w-[300px] h-screen top-[0px] py-12">
        <div className="text-primary ml-28 mb-10  text-6xl">
          <MdForum />
        </div>
        <section className="border-primary border-t-8 flex-grow text-black text-xl rounded-xl bg-quartiary/80 w-full flex flex-col">
          <div className="m-4 ml-12 pt-8">
            <SearchInput onSearch={handleSearch} />
            <div className="m-4 mt-8 -ml-4 text-2xl pb-20 space-y-6 border-s-2 border-primary">
              <SidebarLink href="/" icon={<LuHome />} label="Home" />
              {user && (
                <SidebarLink href="/library" icon={<LuLibrary />} label="Library" />
              )}
              <SidebarLink
                href="/random"
                icon={<FaUserFriends />}
                label="Clover"
                onClick={handleRandomClick}
              />
              <SidebarLink href="/lists" icon={<IoListSharp />} label="Lists" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeftSidebar;