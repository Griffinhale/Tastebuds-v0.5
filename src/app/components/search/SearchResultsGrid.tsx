import React from 'react';
import SearchResult from './SearchResult';
import { useSearch } from "../../contexts/SearchContext";

const SearchResultsGrid = ({ endOfResults }: { endOfResults: boolean }) => {
  const { searchResults: results } = useSearch();

  return (
    <div className="relative grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 4xl:grid-cols-8 3xl:grid-cols-6 xl:grid-cols-5 py-8 space-x-4 mx-4">
      {results.length > 0 ? (
        results.map((result) => (
          <SearchResult key={result.id} result={result} />
        ))
      ) : (
        <div className="flex justify-center mt-8">Loading...</div>
      )}
      {endOfResults && (
        <div className="flex justify-center mt-8">
          End of results reached.
        </div>
      )}
    </div>
  );
};

export default SearchResultsGrid;