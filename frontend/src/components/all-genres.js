import { useState, useEffect } from "react";

const fetchMovies = async () => {
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
export default function Genres({ genres, handlerChange, deleteTag }) {
  const [tags, setTags] = useState({
    allgenres: [],
    error: null,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchMovies();
      if (!res.genres) {
        setTags((prev) => ({ ...prev, loading: false, error: res }));
      } else {
        setTags((prev) => ({
          ...prev,
          loading: false,
          allgenres: res.genres,
        }));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="level">
      <div className="level-left">
        <div className="field">
          <label className="label">Genres</label>
          <div className="control">
            <div className="select">
              <select onChange={handlerChange} name="genres">
                <option value={0}>Choose...</option>
                {tags.allgenres.map((g) => (
                  <option key={g.id} value={`${g.id}-${g.genre_name}`}>
                    {g.genre_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="level-right">
        <div className="tags">
          {Object.keys(genres).map((el) => (
            <span className="tag" key={el}>
              {genres[el]}

              <button
                className="delete is-small"
                onClick={(e) => deleteTag(e, el)}
              ></button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
