import React from 'react';

const LibrarySectionsBar = () => (
  <div className="inline-flex justify-between h-32 w-full border-primary border-b-2 px-12">
    <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
      Books
    </button>
    <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
      Movies
    </button>
    <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
      Music
    </button>
    <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
      Games
    </button>
    <button className="bg-primary w-[10%] px-2 my-8 rounded-xl hover:ring-4">
      All
    </button>
  </div>
);

export default LibrarySectionsBar;