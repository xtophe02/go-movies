import { useState, useEffect } from "react";

const fetchMovies = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_URL}/v1/movies`);
    if (!res.ok) {
      console.log(res);
      throw new Error(res.statusText);
    }
    return res.json();
  } catch (error) {
    return error.message;
  }
};
export default function LazyMovies() {
  const [state, setState] = useState({
    movies: [],
    error: null,
    loading: true,
  });
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchMovies();
      if (!res.movies) {
        setState((prev) => ({ ...prev, loading: false, error: res }));
      } else {
        setState((prev) => ({ ...prev, loading: false, movies: res.movies }));
      }
    };
    fetchData();
  }, []);

  return state.movies.map((mv) => (
    <option key={mv.id} value={mv.id}>
      {mv.title}
    </option>
  ));
}
