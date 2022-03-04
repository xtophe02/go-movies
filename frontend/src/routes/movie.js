import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const fetchMovieByID = async (id) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_URL}/v1/movie/${id}`);
    if (!res.ok) {
      console.log(res);
      throw new Error(res.statusText);
    }
    return res.json();
  } catch (error) {
    return error.message;
  }
};
export default function Movie() {
  let params = useParams();
  const [state, setState] = useState({ loading: true, movie: {}, error: null });
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchMovieByID(params.id);
      if (!res.movie) {
        setState((prev) => ({ ...prev, loading: false, error: res }));
      } else {
        setState((prev) => ({ ...prev, loading: false, movie: res.movie }));
      }
    };
    fetchData();
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
      genres,
    },
  } = state;

  return (
    <>
      <h3 className="title is-3">
        {title} ({year})
      </h3>
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
          <tr>
            <th>Genres:</th>
            <td>{genres && Object.values(genres).map((g) => `${g} `)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
