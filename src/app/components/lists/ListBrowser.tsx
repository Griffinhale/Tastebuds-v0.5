import React, { useEffect } from "react";
import extractDataFromCookie from "../../utils/extractCookie";
import useState from "react-usestateref";

//show all lists, most popular lists, most recent lists, etc.
const ListBrowser = () => {
  const [userId, setUserId, userIdRef] = useState("");
  const [filter, setFilter, filterRef] = useState("default");
  const [lastList, setLastList, lastListRef] = useState(0);
  const [fetchAmount, setFetchAmount, fetchAmountRef] = useState(20);

  // Extract user data from cookie
  useEffect(() => {
    const data = extractDataFromCookie();
    if (data) {
      setUserId(data.userId);
    } else {
      console.log("auth_data not found in cookie");
      setUserId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //fetch lists
  useEffect(() => {
    async function fetchLists(params: {filter: string, userId: string, lastList: number, fetchAmount: number}){
      const data = await fetch("/lists/routes?all=true&filter=" + params.filter, {method: "GET",headers: {
        "Content-Type": "application/json",
      }})
      const results = await data.json()
      console.log(results);
    };
      console.log("filter changed")
    const body = {
      filter: filterRef.current,
      userId: userIdRef.current,
      lastList: lastListRef.current,
      fetchAmount: fetchAmountRef.current,
    };
    fetchLists(body);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRef.current]);


  return <div>ListBrowser
    <div><button onClick={() => setFilter("default")}>default</button>   <button onClick={() => setFilter("popular")}>popular</button></div>
  </div>;
};

export default ListBrowser;
