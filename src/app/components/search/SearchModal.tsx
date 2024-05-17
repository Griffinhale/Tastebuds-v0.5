import { useEffect, useRef } from "react";
import useState from "react-usestateref";
import Link from "next/link";

interface SearchModalProps {
result: any;
show: boolean;
onBlur: () => void;
onClose: () => void;
}

// Define a SearchModal component
const SearchModal: React.FC<SearchModalProps> = ({ show, onClose, result }) => {
  const [detailsLink, setDetailsLink, detailsLinkRef] = useState("");
  const modalRef = useRef<any>();

  // useEffect hook for handling clicks outside of the modal
  useEffect(() => {
    // Function to handle clicks outside of the modal
    const handleClickOutside = (event: { target: any; }) => {
      // If the clicked area is outside the modal, close the modal
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    setDetailsLink("/details/" + result.type + "/" + result.id);

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]); // Dependency array to re-run the effect if onClose changes

  // Conditionally render the modal if 'show' is true
  return show ? (
    <div
      ref={modalRef} // Attach the ref to the modal div
      className=" bg-secondary absolute text-black z-10 w-[60%] p-4 rounded-xl border-4 outline outline-8 outline-black border-primary"
    >
      {/* Modal content */}
      <div className="bg-primary rounded-xl p-4">
        <p>
          {/* Display different content based on the result type */}
          {result.type === "album"
            ? result.creator // For album, show the creator
            : result.description
            ? result.description.slice(0, 300) + "..." // For other types, show a description
            : "..."} {/* Fallback content if description is not available */}
        </p>
      </div>
      {/* Close button */}
      <button
        className="py-4 w-1/5 rounded-xl mt-4 bg-primary mx-24"
        onClick={onClose} // Handle close action
      >
        Close
      </button>
      {/* Link to more details */}
      <Link
        className="py-4 w-1/5 rounded-xl mt-4 bg-primary mx-24"
        href={detailsLinkRef.current} // Use the details link
      >
        More Details
      </Link>
    </div>
  ) : null; // Render null if 'show' is false
};

export default SearchModal;
