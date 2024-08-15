"use client";
import SearchResults from '../components/search/SearchResults';
import { Suspense } from 'react';

const SearchPage = () => {
  return (
  <Suspense>
    <SearchResults />
  </Suspense>
  );
};

export default SearchPage;