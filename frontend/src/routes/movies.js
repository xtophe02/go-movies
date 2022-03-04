import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

const fetchMovies = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_URL}/v1/movies`);
    // console.log(res);
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return res.json();
  } catch (error) {
    return error.message;
  }
};

export default function Movies() {
  const [state, setState] = useState({
    loading: true,
    movies: [],
    error: null,
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
  if (state.loading) {
    return <p>loading...</p>;
  }
  if (state.error) {
    return <p>{state.error}</p>;
  }

  return (
    <section className="hero">
      <div className="hero-body">
        <p className="title">Choose a Movie REST</p>
        <div className="content">
          <ul>
            {state.movies.map((mv) => (
              <li key={mv.id}>
                <Link to={`/movies/${mv.id}`}>{mv.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <Outlet />
      </div>
    </section>
  );
}
