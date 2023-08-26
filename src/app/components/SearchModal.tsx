import { useEffect, useRef } from "react";
import useState from "react-usestateref";
import Link from "next/link";

const SearchModal = ({ show, onClose, result }) => {
  const [detailsLink, setDetailsLink, detailsLinkRef] = useState("");
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    setDetailsLink("/details/" + result.type + "/" + result.id);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return show ? (
    <div
      ref={modalRef}
      className=" bg-secondary absolute text-black z-10 w-[60%] p-4 rounded-xl border-4 outline outline-8 outline-black border-primary"
    >
      <div className="bg-primary rounded-xl p-4">
        {}
        <p>
          {result.type === "album"
            ? result.creator
            : result.description
            ? result.description.slice(0, 300) + "..."
            : "..."}
        </p>
      </div>
      <button
        className="py-4 w-1/5 rounded-xl mt-4 bg-primary mx-24"
        onClick={onClose}
      >
        Close
      </button>
      <Link
        className="py-4 w-1/5 rounded-xl mt-4 bg-primary mx-24"
        href={detailsLinkRef.current}
      >
        More Details
      </Link>
    </div>
  ) : null;
};

export default SearchModal;
