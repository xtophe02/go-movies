import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SearchBox from "../components/search-box";

export default function MoviesGraphql() {
  const [state, setState] = useState({
    loading: true,
    movies: [],
    errors: null,
    clear: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const query = `{
      allMovies {
        id
        title
        year
        description
        runtime
        poster
      }
    }`;
    fetch(`${process.env.REACT_APP_URL}/v1/graphql`, {
      signal: signal,
      method: "post",
      body: query,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ data }) => {
        // console.log(data);
        setState({ movies: data.allMovies, loading: false, clear: false });
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("successfully aborted");
        } else {
          console.log(err);
          // setError(err);
        }
      });
    return () => controller.abort();
  }, [state.clear]);
  if (state.loading) {
    return <p>loading...</p>;
  }
  if (state.error) {
    return <p>{state.error}</p>;
  }

  return (
    <section className="hero">
      <div className="hero-body">
        <p className="title">Choose a Movie GRAPHQL</p>
        <SearchBox state={state} setState={setState} />
        <div className="content">
          <table className="table is-striped is-hoverable">
            <tbody>
              {state.movies.length > 0 ? (
                state.movies.map((mv) => (
                  <tr
                    key={mv.id}
                    className="is-clickable"
                    onClick={() => navigate(`/movies-graphql/${mv.id}`)}
                  >
                    <td>
                      <strong>{mv.title}</strong> <br />
                      <small className="has-text-grey">
                        ({mv.year}) - {mv.runtime} min
                      </small>
                      <br />
                      <small>{mv.description.slice(0, 100)}...</small>
                    </td>
                    {mv.poster !== "" && (
                      <td className="is-pull-left">
                        <figure className="image is-48x48">
                          <img
                            src={`https://image.tmdb.org/t/p/w200${mv.poster}`}
                            alt="pic movie"
                          />
                        </figure>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <p className="has-text-grey">no movies on database</p>
              )}
            </tbody>
          </table>
        </div>
        <Outlet />
      </div>
    </section>
  );
}
