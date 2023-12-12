import { useEffect } from 'react'
import useState from "react-usestateref"
import Link from "next/link"

// Define a Header component
const Header = () => {
  // Using useStateRef to create a state variable for user along with a reference to it
  const [user, setUser, userRef] = useState("")

  // useEffect hook to run side effects, in this case, to extract user data from cookies
  useEffect(() => {
    // Function to extract user data from cookie
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
  
    // Extract user data and update the user state
    const data = extractDataFromCookie();
    if (data) {
        console.log("UserId:", data.userId);
        console.log("ScreenName:", data.screenName);
        setUser(data.screenName); // Set the user's screen name
    } else {
        console.log("auth_data not found in cookie");
        setUser("") // Clear the user state if auth data is not found
    }
  }, [setUser]) // Empty dependency array means this effect runs only once when the component mounts

  // Render the header component
  return (
    <div className="h-24 w-full inline-flex my-6">
        <div className="mt-20 text-xl ml-20 w-[75%]">
          {/* Display the user's screen name if logged in, otherwise show a link to sign up/login */}
          {userRef.current !== ""? <Link href="/library">{userRef.current}</Link>:<Link href="/login">Sign Up/Login</Link>}
        </div>
        <div className="w-1/5 text-4xl font-bold pl-6 pt-10 pr-6">
          <h1>TasteBuds</h1> {/* Static title for the header */}
        </div>
      </div>
  )
}

export default Header