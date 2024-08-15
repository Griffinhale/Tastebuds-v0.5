import supabase from "../utils/supabaseClient";

export const fetchBooks = async (term: string, page: number) => {
  const response = await fetch("/search/routes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      term,
      page,
      type: "book",
    }),
  });
  const data = await response.json();
  return data;
};

export const fetchAlbums = async (term: string, page: number) => {
  const response = await fetch("/search/routes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      term,
      page,
      type: "album",
    }),
  });
  const data = await response.json();
  return data;
};

export const fetchVideos = async (term: string, page: number) => {
  const response = await fetch("/search/routes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      term,
      page,
      type: "video",
    }),
  });
  const data = await response.json();
  return data;
};

export const fetchGames = async (term: string, page: number) => {
  const response = await fetch("/search/routes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      term,
      page,
      type: "game",
    }),
  });
  const data = await response.json();
  return data;
};

export const fetchLibraryResults = async (term: string) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .textSearch("title", `${term.trim().split(" ").join("&")}`);

  if (error) {
    console.error("Error fetching data: ", error);
    return [];
  }
  return data;
};