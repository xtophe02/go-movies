import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MovieGraphql() {
  let params = useParams();
  const [state, setState] = useState({ loading: true, movie: {}, error: null });
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const query = `{
      movie (id: ${params.id}) {
        id
        title
        year
        description
        runtime
        mpaa_rating
        rating
        release_date
        year
        poster
        genres{
          genre {
            genre_name
          }
        }
      }
    }`;
    // const query = `{untyped{name}}`;
    fetch(`${process.env.REACT_APP_URL}/v1/graphql`, {
      signal: signal,
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ data }) => {
        // console.log(data);
        setState({ movie: data.movie, loading: false });
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
  }, [params.id]);
  if (state.loading) {
    return <p>loading...</p>;
  }
  if (state.error) {
    return <p>{state.error}</p>;
  }
  const {
    movie: {
      title,
      runtime,
      description,
      mpaa_rating,
      rating,
      release_date,
      year,
      poster,
    },
  } = state;
  // console.log(poster);
  return (
    <>
      <div className="media">
        {poster !== "" && (
          <div className="media-left">
            <p className="image is-256x256">
              <img
                src={`https://image.tmdb.org/t/p/w200${poster}`}
                alt="pic movie"
              />
            </p>
          </div>
        )}
        <div className="media-content">
          <h3 className="title is-3">
            {title} ({year}){" "}
          </h3>{" "}
          <table className="table is-striped is-fullwidth">
            <tbody>
              <tr>
                <th>Title:</th>
                <td>{title}</td>
              </tr>
              <tr>
                <th>Run Time:</th>
                <td>{runtime}</td>
              </tr>
              <tr>
                <th>Description:</th>
                <td>{description}</td>
              </tr>
              <tr>
                <th>MPAA Rating:</th>
                <td>{mpaa_rating}</td>
              </tr>
              <tr>
                <th>Rating:</th>
                <td>{rating}</td>
              </tr>
              <tr>
                <th>Release Date:</th>
                <td>{new Date(release_date).toLocaleDateString("pt-pt")}</td>
              </tr>
              <tr>
                <th>Year:</th>
                <td>{year}</td>
              </tr>
              {/* <tr>
            <th>Genres:</th>
            <td>{genres && Object.values(genres).map((g) => `${g} `)}</td>
          </tr> */}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
