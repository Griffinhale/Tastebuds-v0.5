/* eslint-disable @next/next/no-img-element */
"use client"; // Directive to ensure this code runs on the client side in a Next.js application
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useEffect } from "react"; // Import useEffect hook from React for handling side effects
import useState from "react-usestateref"; // Import custom useState hook that provides a ref to the state

import supabase from "../utils/supabaseClient"; // Import supabase client for database interactions
import * as DOMPurify from "dompurify"; // Import DOMPurify for sanitizing HTML to prevent XSS attacks
import extractDataFromCookie from "../utils/extractCookie"; // Import function to extract data from cookies
import toast from "react-hot-toast";
import DetailsCoverCard from "./DetailsCoverCard";

interface Params {
  params: [string, string];
}

// BookDetails component declaration using destructuring to extract params from props
const BookDetails: React.FC<Params> = ({ params }) => {
  // State declarations for various aspects of the component
  const [results, setResults, resultsRef] = useState<any>([]); // State to hold book details
  const [isLoading, setIsLoading, isLoadingRef] = useState(true); // State to track loading status
  const [userId, setUserId, userIdRef] = useState(""); // State for storing user ID
  let dimensionStr: string = ""; // Variable for formatting book dimensions


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
  // Extract user ID from cookie
  useEffect(() => {
    const data = extractDataFromCookie();
    if (data) {
      setUserId(data.userId);
    } else {
      console.log("auth_data not found in cookie");
      setUserId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Grab further details on component mount
  useEffect(() => {
    // Async function to fetch book details
    async function getBookDetails(item_id: string) {
      // Fetching book details from the database
      const { data: bookDetails, error: bookDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      // Additional request to fetch more details using an external API
      const bodyData = { type: params[0], api_id: bookDetails![0].api_id };
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
      // Normalize properties for components
      data.volumeInfo.description = {
        __html: DOMPurify.sanitize(data.volumeInfo.description),
      };
      data.cover = bookDetails![0].cover;
      data.title = data.volumeInfo.title;
      data.creator = data.volumeInfo.authors?data.volumeInfo.authors[0]:"Unknown";
      setResults(data);
      setIsLoading(false);
    }
    // Execute the function to fetch book details
    getBookDetails(params[1]);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

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
          <div className="p-16 space-x-2 flex 2xl:flex-row flex-col justify-between text-black">
            <div className="flex-row content-center w-90">
              <DetailsCoverCard userId={userIdRef.current} id={resultsRef.current.id} title={resultsRef.current.title} cover={resultsRef.current.cover} creator={resultsRef.current.creator}/>
              
              {/*description*/}
              <div className="p-24">
                <p
                  className="whitespace-pre-line"
                  dangerouslySetInnerHTML={
                    resultsRef.current.volumeInfo.description
                  }
                ></p>
              </div>
            </div>

            {/*bookDetails*/}
            <div className="flex-col flex justify-between w-4/5 p-4">
              <div>
                <ul>
                  <p className="font-bold">Categories:</p>
                  {resultsRef.current.volumeInfo.categories?.map(
                    (category: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined, index: Key | null | undefined) => {
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
