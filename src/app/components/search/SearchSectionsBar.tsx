import React from 'react';

type SearchSectionsBarProps = {
  user: any;
  handleCategoryClick: (category: string) => void;
};

const SearchSectionsBar = ({ user, handleCategoryClick }: SearchSectionsBarProps) => (
  <div className="inline-flex justify-between h-32 w-full border-primary border-b-2 px-12">
    {user && user.id ? (
      <button
        onClick={() => handleCategoryClick("Your Library")}
        className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:outline-none focus:ring-4"
      >
        Your Library
      </button>
    ) : null}
    <button
      onClick={() => handleCategoryClick("Books")}
      className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:ring-4"
    >
      Books
    </button>
    <button
      onClick={() => handleCategoryClick("Videos")}
      className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:ring-4"
    >
      Movies
    </button>
    <button
      onClick={() => handleCategoryClick("Albums")}
      className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:ring-4"
    >
      Music
    </button>
    <button
      onClick={() => handleCategoryClick("Games")}
      className="bg-primary w-[10%] px-2 my-8 rounded-xl focus:ring-4"
    >
      Games
    </button>
  </div>
);

export default SearchSectionsBar;