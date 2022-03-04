import { Link, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const fetchMoviesByGenreID = async (id) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_URL}/v1/movies/${id}`);
    if (!res.ok) {
      console.log(res);
      throw new Error(res.statusText);
    }
    return res.json();
  } catch (error) {
    return error.message;
  }
};
export default function Genre() {
  let params = useParams();
  let location = useLocation();
  const genreName = location.search.split("=")[1];
  const [state, setState] = useState({
    loading: true,
    movies: [],
    error: null,
  });
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchMoviesByGenreID(params.id);
      if (!res.movies) {
        setState((prev) => ({ ...prev, loading: false, error: res }));
      } else {
        setState((prev) => ({ ...prev, loading: false, movies: res.movies }));
      }
    };
    fetchData();
  }, [params.id]);

  return (
    <>
      {" "}
      <h3 className="title is-3">{genreName}</h3>
      {state.movies.length > 0 ? (
        <ul>
          {state.movies.map((mv) => (
            <li key={mv.id}>
              <Link to={`/movies/${mv.id}`}>{mv.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No movies of this genre</p>
      )}
    </>
  );
}
