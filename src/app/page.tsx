"use client"
import { useRouter, usePathname } from 'next/navigation';
import HomePage from "./components/home/HomePage"
import Library from './components/library/Library';
import SearchResults from './components/search/SearchResults';

const Home = () => {
  const router = useRouter();
  const pathname = usePathname();

  let PageComponent;

  switch (true) {
    case pathname === '/':
      PageComponent = HomePage;
      break;
    case pathname === '/library':
      PageComponent = Library;
      break;
    case pathname.startsWith('/search'):
      PageComponent = SearchResults;
      break;
    // Add more cases as needed
    default:
      PageComponent = HomePage;
  }

  return (

        <PageComponent/>

  )
}

export default Home