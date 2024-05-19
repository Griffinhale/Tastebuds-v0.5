import React from 'react';

const PinnedContent = () => (
  <div className="justify-between flex px-12 py-4 border-b-2 border-primary">
    {/* Placeholder pinned content items */}
    {[...Array(5)].map((_, index) => (
      <button key={index} className="rounded-xl hover:ring-4">
        <div className="flex-col flex justify-center items-center">
          <div className="w-32 h-32 rounded-full bg-slate-500"></div>
          <h1 className="pt-4">Title</h1>
        </div>
      </button>
    ))}
  </div>
);

export default PinnedContent;