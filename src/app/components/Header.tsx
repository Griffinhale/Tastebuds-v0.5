import {useEffect} from 'react'
import useState from "react-usestateref"
import Link from "next/link"

const Header = () => {
  const [user, setUser, userRef] = useState("")
  useEffect(() => {
    function extractDataFromCookie() {
      // Get the entire cookie string
      const cookieString = document.cookie;
  
      // Extract the auth_data value from the cookie string
      const authDataMatch = cookieString.match(/auth_data=([^;]+)/);
      if (!authDataMatch) return null;
  
      // Decode the URI component to get the JSON string
      const authDataJSON = decodeURIComponent(authDataMatch[1]);
  
      // Parse the JSON string to get the object
      const authDataObj = JSON.parse(authDataJSON);
  
      // Extract the userId and screenName properties
      const userId = authDataObj.userId;
      const screenName = authDataObj.screenName;
  
      return { userId, screenName };
  }
  
  const data = extractDataFromCookie();
  if (data) {
      console.log("UserId:", data.userId);
      console.log("ScreenName:", data.screenName);
      setUser(data.screenName);
  } else {
      console.log("auth_data not found in cookie");
      setUser("")
  }
  }, [])
  return (
    <div className="h-24 w-full inline-flex my-6">
        <div className="mt-20 text-xl ml-20 w-[75%]">
          {userRef.current !== ""? <Link href="/library">{userRef.current}</Link>:<Link href="/login">Sign Up/Login</Link>}
        </div>
        <div className="w-1/5 text-4xl font-bold pl-6 pt-10 pr-6">
          <h1>TasteBuds</h1>
        </div>
      </div>
  )
}

export default Header