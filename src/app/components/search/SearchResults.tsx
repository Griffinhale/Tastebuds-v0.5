"use client";
import React, { useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../contexts/UserContext";
import { useSearch } from "../../contexts/SearchContext";
import Header from "../common/Header";
import SearchCategoryButtons from "./SearchSectionsBar";
import SearchResultsGrid from "./SearchResultsGrid";

const SearchResults = () => {
  const { user, setUserId } = useUser();
  const {
    term, setTerm,
    searchResults: results, setSearchResults: setResults,
    isLoading, setIsLoading,
    page, setPage,
    endOfResults, setEndOfResults,
    category, setCategory,
    search
  } = useSearch();
  const router = useRouter();
  const params = useSearchParams();

  const useDebounce = (func: any, delay: any) => {
    const callback = useRef(func);

    useEffect(() => {
      callback.current = func;
    }, [func]);

    return useCallback(
      (...args: any) => {
        const currentCallback = callback.current;
        clearTimeout(callback.current.timer);
        callback.current.timer = setTimeout(() => {
          currentCallback(...args);
        }, delay);
      },
      [delay]
    );
  };

  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !endOfResults && !isLoading) {
      const nextPage = page + 1;
      search(term, nextPage, category);
      setPage(nextPage);
      setIsLoading(true);
    }
  }, [category, endOfResults, isLoading, page, search, setIsLoading, setPage, term]);

  const debouncedHandleScroll = useDebounce(handleScroll, 500);

  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  const termCheck = params.get("term");

  useEffect(() => {
    const wipeResults = async () => {
      setResults([]);
      console.log("wiping results");
    };

    wipeResults();
    const newTerm = termCheck || "default search term";
    if (term !== newTerm) {
      console.log("changed term");
      setTerm(newTerm);
    }
  }, [termCheck, term, setResults, setTerm]);

  useEffect(() => {
    if (user && user.id) {
      setCategory("Your Library");
      setPage(0);
      console.log("component did mount, search query:", term);
      if (term && category === "Your Library") {
        setIsLoading(true);
        search(term, 0, "Your Library");
      }
    } else {
      console.log("user not logged in, please select category");
    }
  }, [category, search, setCategory, setIsLoading, setPage, term, user]);

  const handleCategoryClick = useCallback((category: string) => {
    setPage(1);
    setResults([]);
    setCategory(category);
    search(term, 1, category);
  }, [term, search, setCategory, setPage, setResults]);

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      <Header />
      <div className="bg-primary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <div className="border-b-2 h-auto border-primary rounded-xl">
          <div className="flex-row flex">
            <h1 className="font-bold text-xl pb-4 ml-4">
              Results for &quot;{term}&quot;
            </h1>
          </div>
        </div>
        <SearchCategoryButtons user={user} handleCategoryClick={handleCategoryClick} />
        {user && !user.id && category === "Your Library" ? (
          <div className="flex justify-center mt-8">
            User not logged in. Please select media format to search through or log in to search library.
          </div>
        ) : (
          <SearchResultsGrid endOfResults={endOfResults} />
        )}
        {endOfResults && results.length === 0 && (
          <div>
            <div className="flex justify-center mt-8">
              No results found. Try a different search term or choose a different media format.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;