import { useEffect } from 'react';
import Link from "next/link";
import { useUser } from "../../contexts/UserContext";
import supabase from "../../utils/supabaseClient";

const Header = () => {
  const { user, logout } = useUser();

  // Supabase log out and refresh token
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      logout();
    }
  };

  return (
    <div className="h-24 w-full inline-flex my-6">
      <div className="mt-20 text-xl inline-flex ml-20 w-[75%]">
        {user.name != "Guest" ? (
          <>
            <p className="pr-4">{user.name}</p>
            <Link onClick={handleLogout} href="/">Sign Out</Link>
          </>
        ) : (
          <Link href="/login">Sign Up/Login</Link>
        )}
      </div>
      <div className="w-1/5 text-4xl font-bold pt-10">
        <h1>TasteBuds</h1>
      </div>
    </div>
  );
};

export default Header;