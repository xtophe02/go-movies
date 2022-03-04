import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const fetchAllGenres = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_URL}/v1/genres`);
    if (!res.ok) {
      console.log(res);
      throw new Error(res.statusText);
    }
    return res.json();
  } catch (error) {
    return error.message;
  }
};

export default function Genres() {
  const [state, setState] = useState({
    loading: true,
    genres: [],
    error: null,
  });
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchAllGenres();
      if (!res.genres) {
        setState((prev) => ({ ...prev, loading: false, error: res }));
      } else {
        setState((prev) => ({ ...prev, loading: false, genres: res.genres }));
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
        <p className="title">Choose a category</p>
        <div className="content">
          <ul>
            {state.genres.map((gr) => (
              <li key={gr.id}>
                <Link to={`/genres/${gr.id}?genre_mame=${gr.genre_name}`}>
                  {gr.genre_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
