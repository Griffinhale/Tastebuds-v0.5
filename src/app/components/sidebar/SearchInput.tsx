import React, { useState, useRef, FormEvent } from "react";
import { LuSearch } from "react-icons/lu";
import { useRouter } from "next/navigation";

interface SearchInputProps {
  onSearch: (term: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(searchTerm);
    setSearchTerm("");
    setIsClicked(false);
    setShowIcon(true);
    inputRef.current!.blur();
  };

  return (
    <div
      onClick={() => {
        if (!isClicked) {
          setIsClicked(true);
          setShowIcon(false);
          inputRef.current!.focus();
        }
      }}
      className={`flex items-center justify-center w-[80%] my-6 mt-0 h-12 relative transition-all duration-500 ease-in-out ${
        isClicked ? "w-[100%]" : "w-12"
      }`}
    >
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={isClicked ? "Search" : ""}
          onFocus={() => {
            setIsClicked(true);
            setShowIcon(false);
          }}
          onBlur={() => {
            setIsClicked(false);
            setTimeout(() => {
              setShowIcon(true);
            }, 400);
          }}
          className={`bg-primary outline-none border-none py-[0.88rem] text-sm rounded-full hover:ring-4 ${
            isClicked ? "w-[100%] px-3" : "w-12 px-1"
          }`}
          style={{ textIndent: isClicked ? "1rem" : "0" }}
        />
      </form>
      {!isClicked && showIcon && <LuSearch className="absolute left-100" />}
    </div>
  );
};

export default SearchInput;