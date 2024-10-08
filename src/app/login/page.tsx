"use client";
import { useRouter, usePathname } from "next/navigation";
import HomePage from "../components/HomePage";
import Library from "../components/Library";
import SearchResults from "../components/SearchResults";
import LogInPage from "../components/LogInPage";
import { BsFileBreakFill } from "react-icons/bs";

const Home = () => {
  const router = useRouter();
  const pathname = usePathname();

  let PageComponent;

  switch (true) {
    case pathname === "/":
      PageComponent = HomePage;
      break;
    case pathname === "/library":
      PageComponent = Library;
      break;
    case pathname.startsWith("/search"):
      PageComponent = SearchResults;
      break;
    case pathname === "/login":
      PageComponent = LogInPage;
      break;
    // Add more cases as needed
    default:
      PageComponent = HomePage;
  }

  return <PageComponent />;
};

export default Home;
