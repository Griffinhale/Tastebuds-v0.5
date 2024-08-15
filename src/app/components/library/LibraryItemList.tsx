import React from 'react';
import LibraryItem from './LibraryItem';

const LibraryItemList = ({ results }: { results: any[] }) => (
  <div className="grid space-x-4 grid-cols-5 py-4">
    {results.length > 0 ? (
      results.map((result, index) => (
        <LibraryItem key={result.item_id || index} result={result} />
      ))
    ) : (
      <p>isloading</p>
    )}
  </div>
);

export default LibraryItemList;