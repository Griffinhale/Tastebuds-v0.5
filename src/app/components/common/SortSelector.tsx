import React from 'react';

const SortSelector = () => (
  <div className="w-full flex focus:drop-shadow-none focus:ring-offset-0 justify-end mt-8">
    <select>
      <option>Alphabetical</option>
      <option>Most Recent</option>
      <option>Highest User Rating</option>
    </select>
  </div>
);

export default SortSelector;