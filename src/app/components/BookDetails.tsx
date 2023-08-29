"use client";
import { useEffect } from "react";
import useState from "react-usestateref";
import { BiCheckCircle, BiErrorCircle, BiPlusCircle } from "react-icons/bi";
import supabase from "../utils/supabaseClient";
import * as DOMPurify from "dompurify"
import Header from "./Header";
import extractDataFromCookie from "../utils/extractCookie";

// Add custom rules for <br> and <p>

const BookDetails = ({ params }: { params: [string] }) => {
  const [results, setResults, resultsRef] = useState([]);
  const [isLoading, setIsLoading, isLoadingRef] = useState(true);
  const [alreadyInLib, setAlreadyInLib, alreadyInLibRef] = useState(false);
  const [addedToLib, setAddedToLib, addedToLibRef] = useState(false);
  const [cover, setCover] = useState("");
  const [userId, setUserId, userIdRef] = useState("");
  let dimensionStr: string = "";

  const addToLibrary = async () => {
    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userIdRef.current);
    let isInUserLibrary = false;
    if (existingItem) {
      console.log("check library");
      const filtered = existingItem.filter(
        (item) => item.item_id === params[1]
      );
      if (filtered.length > 0) {
        isInUserLibrary = true;
        setAddedToLib(true);
        setAlreadyInLib(true);
        console.log("already in library");
      }
    } else if (error) {
      console.log(error);
    }
    if (isInUserLibrary === false) {
      console.log("adding to library");
      console.log(params[1]);
      setAddedToLib(true);
      const { error } = await supabase.from("library").insert({
        item_id: params[1],
        user_id: userId,
      });
      if (error) {
        console.log(error);
      }
    }
  };
  function selectDimensionStyle() {
    console.log(Object.keys(resultsRef.current.volumeInfo.dimensions));
    switch(Object.keys(resultsRef.current.volumeInfo.dimensions).length) {
        case 1: 
          switch(Object.keys(resultsRef.current.volumeInfo.dimensions)[0]){
            case "height": return "Height of " + resultsRef.current.volumeInfo.dimensions.height; break;
            case "width": return "Height of " + resultsRef.current.volumeInfo.dimensions.width; break;
            case "thickness": return "Thickness of " + resultsRef.current.volumeInfo.dimensions.thickness; break;
          }
          break;
        case 2:
          switch(Object.keys(resultsRef.current.volumeInfo.dimensions)) {
            case ["height", "width"]: return "Height of " + resultsRef.current.volumeInfo.dimensions.height + ", width of " + resultsRef.current.volumeInfo.dimensions.width; break;
            case ["thickness", "width"]: return "Thickness of " + resultsRef.current.volumeInfo.dimensions.thickness + ", width of " + resultsRef.current.volumeInfo.dimensions.width; break;
            case ["height", "thickness"]: return "Height of " + resultsRef.current.volumeInfo.dimensions.height + ", thickness of " + resultsRef.current.volumeInfo.dimensions.thickness; break;
          }
          break;
        case 3:
          return dimensionStr = "Height of " + resultsRef.current.volumeInfo.dimensions.height + ", width of " + resultsRef.current.volumeInfo.dimensions.width + ", thickness of " + resultsRef.current.volumeInfo.dimensions.thickness; break;
          break;
        default: 
          return "No dimensions available";
          break;
        }
  }

  useEffect(() => {
    const data = extractDataFromCookie();

    setUserId(data.userId);

    async function getBookDetails(item_id: string) {
      const { data: bookDetails, error: bookDetailsError } = await supabase
        .from("items")
        .select("*")
        .eq("id", item_id);

      
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
      console.log(data);
      data.volumeInfo.description = {__html: DOMPurify.sanitize(data.volumeInfo.description)};
      console.log(data.volumeInfo.description);
      setResults(data);
      setIsLoading(false);
      console.log(resultsRef.current);
      return data;
    }
    console.log(params);
    getBookDetails(params[1]);
  }, []);

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
              <p className="whitespace-pre-line" dangerouslySetInnerHTML={resultsRef.current.volumeInfo.description}>
                
              </p>
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
                  Dimensions: {resultsRef.current.volumeInfo.hasOwnProperty("dimensions")?selectDimensionStyle():"No Dimensions Available"}
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
