"use client";
import React, { useState } from 'react';
import SearchModal from "./SearchModal";
import SearchResultCard from './SearchResultCard';
import AddToLibraryButton from '../common/AddToLibraryButton';
import { useUI } from "../../contexts/UIContext";

type SearchResultProps = {
  result: {
    id: string;
    title: string;
    type: string;
    cover: string;
  };
};

const SearchResult = ({ result }: SearchResultProps) => {
  const { openModal, closeModal } = useUI();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    openModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    closeModal();
  };

  return (
    <div className="py-4">
      <SearchResultCard
        id={result.id}
        title={result.title}
        type={result.type}
        cover={result.cover}
        onOpenModal={handleOpenModal}
      />
      <AddToLibraryButton itemId={result.id} />
      <div className="w-[20%]">
        <SearchModal
          result={result}
          show={isModalOpen}
          onBlur={handleCloseModal}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default SearchResult;