import {useEffect} from "react";
import Header from "./Header";
import supabase from "../utils/supabaseClient";

const LogInPage = () => {
  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const form = e.target;
    const formData = new FormData(form);
    const body = JSON.stringify({
      screen_name: formData.get("screen_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      type: "signup",
    });

    const res = await fetch("http://localhost:3000/login/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const data = await res.json();
    console.log(data);
  };
  const handleLogin = async (e) => {
    const form = e.target;
    const formData = new FormData(form);
    const body = JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
      type: "login"
    })

    const res = await fetch("http://localhost:3000/login/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    })
    const data = await res.json();
    console.log(data.data.session);
  };

  useEffect(() => {
    async function checkLogin() {
      const { data, error } = await supabase.auth.getSession()
      console.log(error)
    }
    
    checkLogin();
  })

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
            <label className=" p-2 rounded-xl underline " for="screen_name">
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
            <label className=" p-2 rounded-xl underline " for="email">
              Email
            </label>
            <br />
            <input
              className=" rounded-xl"
              type="email"
              name="email"
              required
              pattern=".+@.+"
            />
            <br />
            <label className=" p-2 rounded-xl underline" for="password">
              Password
            </label>
            <br />
            <input
              className=" rounded-xl"
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
          <form onSubmit={handleLogin} method="post" className="flex flex-col border-black border-s-2 p-4 rounded-xl mt-8">
            <label for="email">Email</label>
            <br />
            <input name="email" type="email"></input>
            <br />
            <label for="password">Password</label>
            <br />
            <input name="password" type="password"></input>
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
