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

  export default extractDataFromCookie;