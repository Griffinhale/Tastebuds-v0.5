/*
* Component to hold item description on details page
*/

import React, { useEffect } from "react";
import { useExpandedItemDetails } from "../../contexts/ExpandedItemDetailsContext"; // Import useExpandedItemDetails from context

const DetailsDescriptionCard: React.FC = () => {
  const { itemDetails } = useExpandedItemDetails(); // Use the context to get item details

  useEffect(() => {
    if (itemDetails) {
      console.log(itemDetails.description);
    }
  }, [itemDetails]);

  if (!itemDetails) {
    return <div>Loading...</div>;
  }

  // Return description box, with parsed HTML if reading from Google Books API
  return (
    <div className="bg-quartiary/90 rounded-xl flex flex-col items-center lg:flex-row p-6">
      {itemDetails.type == "book" ? (
        <p
          className="whitespace-pre-line"
          dangerouslySetInnerHTML={itemDetails.description}
        ></p>
      ) : (
        <p>{itemDetails.description}</p>
      )}
    </div>
  );
};

export default DetailsDescriptionCard;
