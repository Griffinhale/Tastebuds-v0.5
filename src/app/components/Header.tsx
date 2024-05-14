import { useEffect } from 'react'

import useState from "react-usestateref"
import Link from "next/link"
import extractDataFromCookie from '../utils/extractCookie'
import supabase from "../utils/supabaseClient";

// Define a Header component
const Header = () => {
  // Using useStateRef to create a state variable for user along with a reference to it
  const [userId, setUserId, userIdRef] = useState("");
  const [screenName, setScreenName, screenNameRef] = useState("");

  //Supabase log out and refresh token
  const logOut = async () => {
    console.log(document.cookie)
    const {error} = await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    });
    console.log(document.cookie);
    location.reload();
  }
  // useEffect hook to run side effects, in this case, to extract user data from cookies
  useEffect(() => {
    // Extract user data from cookies
    const data = extractDataFromCookie();
    if (data) {
      setUserId(data.userId); // Set user ID from extracted data
      setScreenName(data.screenName); // Set screen name from extracted data
    } else {
      console.log("auth_data not found in cookie");
      setUserId(""); // Clear user ID if auth data not found
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render the header component
  return (
    <div className="h-24 w-full inline-flex my-6">
        <div className="mt-20 text-xl inline-flex ml-20 w-[75%]">
          {/* Display the user's screen name if logged in, otherwise show a link to sign up/login */}
          {userIdRef.current !== ""?(<><p className="pr-4">{screenNameRef.current}</p> <Link onClick={logOut} href="/">Sign Out</Link></>):<Link href="/login">Sign Up/Login</Link>}
        </div>
        <div className="w-1/5 text-4xl font-bold pt-10">
          <h1>TasteBuds</h1> {/* Static title for the header */}
        </div>
      </div>
  )
}

export default Header