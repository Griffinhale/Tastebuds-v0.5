"use client"; // Directive to ensure this code runs on the client side in a Next.js application
import { useEffect } from "react"; // Import useEffect hook from React for handling side effects
import useState from "react-usestateref"; // Import custom useState hook that provides a ref to the state
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi"; // Import icons from react-icons library
import supabase from "../utils/supabaseClient"; // Import supabase client for database interactions
import * as DOMPurify from "dompurify"; // Import DOMPurify for sanitizing HTML to prevent XSS attacks
import extractDataFromCookie from "../utils/extractCookie"; // Import function to extract data from cookies
import toast from "react-hot-toast";

// BookDetails component declaration using destructuring to extract params from props
const BookDetails = ({ params }: { params: [string] }) => {
  // State declarations for various aspects of the component
  const [results, setResults, resultsRef] = useState([]); // State to hold book details
  const [isLoading, setIsLoading, isLoadingRef] = useState(true); // State to track loading status
  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false); // State to check if book is already in library
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false); // State to check if book was added to library
  const [cover, setCover] = useState(""); // State for book cover (unused in this snippet)
  const [userId, setUserId, userIdRef] = useState(""); // State for storing user ID
  let dimensionStr: string = ""; // Variable for formatting book dimensions

  // Async function to add a book to the library
  const addToLibrary = async () => {
    // Fire toast notification if no user logged in
    if (userId === "") {
      toast.error("Log in to add to Library");
      console.log("no user");
      return; // This will exit the addToLibrary function
    }

    // Querying supabase to check if the book is already in the user's library
    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userIdRef.current);
    let isInUserLibrary = false;
    // Check if the book is already in the library
    if (existingItem) {
      const filtered = existingItem.filter(
        (item) => item.item_id === params[1]
      );
      if (filtered.length > 0) {
        isInUserLibrary = true;
        setAddedToLib(true);
        setAlreadyInLib(true);
        console.log("already in library");
        toast.error("Already in Library!");
      }
    } else if (existingItemError) {
      console.log(existingItemError);
    }
    // Add book to the library if it's not already there
    if (!isInUserLibrary) {
      setAddedToLib(true);
      const { error } = await supabase.from("library").insert({
        item_id: params[1],
        user_id: userId,
      });
      if (error) {
        console.log(error);
      } else {
        toast.success("Added to Library!");
      }
    }
  };

  // Function to determine and format the book's dimensions for display
  function selectDimensionStyle() {
    // Switch statement based on the number of dimensions available
    switch (Object.keys(resultsRef.current.volumeInfo.dimensions).length) {
      case 1:
        switch (Object.keys(resultsRef.current.volumeInfo.dimensions)[0]) {
          case "height":
            return (
              "Height of " + resultsRef.current.volumeInfo.dimensions.height
            );
          case "width":
            return "Width of " + resultsRef.current.volumeInfo.dimensions.width;
          case "thickness":
            return (
              "Thickness of " +
              resultsRef.current.volumeInfo.dimensions.thickness
            );
        }
        break;
      case 2:
        switch (Object.keys(resultsRef.current.volumeInfo.dimensions)) {
          case ["height", "width"]:
            return (
              "Height of " +
              resultsRef.current.volumeInfo.dimensions.height +
              ", width of " +
              resultsRef.current.volumeInfo.dimensions.width
            );
          case ["thickness", "width"]:
            return (
              "Thickness of " +
              resultsRef.current.volumeInfo.dimensions.thickness +
              ", width of " +
              resultsRef.current.volumeInfo.dimensions.width
            );
          case ["height", "thickness"]:
            return (
              "Height of " +
              resultsRef.current.volumeInfo.dimensions.height +
              ", thickness of " +
              resultsRef.current.volumeInfo.dimensions.thickness
            );
        }
        break;
      case 3:
        return (dimensionStr =
          "Height of " +
          resultsRef.current.volumeInfo.dimensions.height +
          ", width of " +
          resultsRef.current.volumeInfo.dimensions.width +
          ", thickness of " +
          resultsRef.current.volumeInfo.dimensions.thickness);
      default:
        return "No dimensions available";
    }
  }

  // useEffect hook to perform actions on component mount
  useEffect(() => {
    // Extract user ID from cookie
    const data = extractDataFromCookie();
    if (data) {
      console.log("UserId:", data.userId);
      console.log("ScreenName:", data.screenName);
      setUserId(data.userId);
    } else {
      console.log("auth_data not found in cookie");
      setUserId("");
    }

    // Async function to fetch book details
    async function getBookDetails(item_id: string) {
      // Fetching book details from the database
      const { data: bookDetails, error: bookDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      // Additional request to fetch more details using an external API
      const bodyData = { type: params[0], api_id: bookDetails[0].api_id };
      const response = await fetch(
        "/details/" + params[0] + "/" + params[1] + "/routes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );
      const data = await response.json();
      data.volumeInfo.description = {
        __html: DOMPurify.sanitize(data.volumeInfo.description),
      };
      setResults(data);
      setIsLoading(false);
    }
    // Execute the function to fetch book details
    getBookDetails(params[1]);
  }, []);

  // JSX to render the component
  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      {/*Header*/}

      {/*Main Content*/}
      <div className="bg-quartiary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        {/*Info*/}
        {isLoadingRef.current ? (
          <div className="border-primary border-2 text-black">loading</div>
        ) : (
          <div className="p-16 space-x-2 flex xl:flex-row flex-col justify-between border-primary border-2 text-black">
            <div className="border-primary flex flex-col items-center lg:justify-start justify-between border-2 p-4">
              <h1 className="text-3xl font-bold">
                {resultsRef.current.volumeInfo.title}
              </h1>
              <h2 className="text-xl">
                {resultsRef.current.volumeInfo.subtitle}, by{" "}
                {resultsRef.current.volumeInfo.authors[0]}
              </h2>
              <a href={resultsRef.current.volumeInfo.previewLink}>
                <img
                  src={resultsRef.current.volumeInfo.imageLinks.thumbnail}
                  alt="cover"
                />
              </a>
              <button
                onClick={addToLibrary}
                className="enabled:hover:ring-4 justify-center items-center flex bg-primary w-8 h-8 rounded-xl disabled:opacity-60"
                disabled={addedToLibRef.current === true ? true : false}
              >
                {addedToLibRef.current === true ? (
                  alreadyInLibRef.current === true ? (
                    <BiErrorCircle />
                  ) : (
                    <BiCheckCircle />
                  )
                ) : (
                  <BiPlusCircle />
                )}
              </button>
            </div>
            <div className="border-primary w-4/5 border-2 p-4">
              <p
                className="whitespace-pre-line"
                dangerouslySetInnerHTML={
                  resultsRef.current.volumeInfo.description
                }
              ></p>
            </div>
            <div className="border-primary flex-col flex justify-between w-4/5 border-2 p-4">
              <div>
                <ul>
                  <p className="font-bold">Categories:</p>
                  {resultsRef.current.volumeInfo.categories?.map(
                    (category, index) => {
                      return <li key={index}>{category}</li>;
                    }
                  )}
                </ul>
              </div>
              <div>
                <p>Page count: {resultsRef.current.volumeInfo.pageCount}</p>
                <p>
                  Dimensions:{" "}
                  {resultsRef.current.volumeInfo.hasOwnProperty("dimensions")
                    ? selectDimensionStyle()
                    : "No Dimensions Available"}
                </p>
                <p>
                  Date Published: {resultsRef.current.volumeInfo.publishedDate}
                </p>
                <p>Publisher: {resultsRef.current.volumeInfo.publisher}</p>
                <p>
                  Average Rating: {resultsRef.current.volumeInfo.averageRating}
                  /5
                </p>
                <a href={resultsRef.current.volumeInfo.infoLink}>
                  Google Details Page
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
