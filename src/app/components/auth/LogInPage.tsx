import { useEffect } from "react";
import Header from "../common/Header";
import { useRouter } from "next/navigation";
import { useUser } from "../../contexts/UserContext";

// Define a component for the login page
const LogInPage = () => {
  const router = useRouter();
  const { user, login } = useUser(); // Use the context for user authentication


  // Function to handle user sign up
  const handleSignup = async (e: any) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get form data
    const form = e.target;
    const formData = new FormData(form);
    // Construct a JSON body with the form data
    const body = JSON.stringify({
      screen_name: formData.get("screen_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      type: "signup",
    });

    // Send a POST request to the server to handle the signup
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const data = await res.json(); // Parse the response
    if (data.status === 200) {
      const userData = {
        id: data.data.userId,
        name: data.data.screenName,
        email: formData.get("email") as string,
      };
      login(userData, data.data.token); // Login the user using the context
      router.push("/");
    } else {
      console.error('Signup failed:', data.error);
    }
  };

  // Function to handle user login
  const handleLogin = async (e: any) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get form data
    const form = e.target;
    const formData = new FormData(form);
    // Construct a JSON body with the form data
    const body = JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
      type: "login",
    });

    // Send a POST request to the server to handle the login
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const data = await res.json(); // Parse the response
    if (data.status === 200) {
      const userData = {
        id: data.data.userId,
        name: data.data.screenName,
        email: formData.get("email") as string,
      };
      login(userData, data.data.token); // Login the user using the context
      router.push("/");
    } else {
      console.error('Login failed:', data.error);
    }
  };

  // useEffect hook to check the login status when the component mounts
  useEffect(() => {
    if (user && user.id) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      {/*Header*/}
      <Header />

      {/*Main Content*/}
      <div className="bg-primary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <div className="border-b-2 h-auto border-primary rounded-xl">
          <div className="flex-row flex">
            <h1 className="font-bold text-xl pb-4 ml-4">Login or Register</h1>
          </div>
        </div>

        {/*Log In Form*/}
        <div className="flex-row flex">
          <form
            onSubmit={handleSignup}
            className="flex flex-col justify-center w-full mt-6 border-s-[2px] border-black rounded-xl p-4"
            method="post"
          >
            <label className=" p-2 rounded-xl underline " htmlFor="screen_name">
              Screen Name
            </label>
            <br />
            <input
              className=" rounded-xl"
              type="text"
              name="screen_name"
              required
            />
            <br />
            <label className=" p-2 rounded-xl underline " htmlFor="email">
              Email
            </label>
            <br />
            <input
              autoComplete="off"
              className=" rounded-xl"
              type="email"
              name="email"
              required
              pattern=".+@.+"
            />
            <br />
            <label className=" p-2 rounded-xl underline" htmlFor="password">
              Password
            </label>
            <br />
            <input
              className=" rounded-xl"
              autoComplete="new-password"
              type="password"
              name="password"
              required
              pattern="[a-z0-9]{1,15}"
            />
            <br />
            <button
              className="bg-primary mt-4 px-4 py-2 border-black rounded-xl border-2"
              type="submit"
            >
              Submit
            </button>
          </form>
          <form
            onSubmit={handleLogin}
            method="post"
            className="flex flex-col border-black border-s-2 p-4 rounded-xl mt-8"
          >
            <label htmlFor="email">Email</label>
            <br />
            <input autoComplete="off" name="email" type="email"></input>
            <br />
            <label htmlFor="password">Password</label>
            <br />
            <input autoComplete="current-password" name="password" type="password"></input>
            <br />
            <button
              className="bg-primary mt-4 px-4 py-2 border-black rounded-xl border-2"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;