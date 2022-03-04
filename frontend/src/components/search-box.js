import React, { useState } from "react";

export default function SearchBox({ state, setState }) {
  const [search, setSearch] = useState("");
  const handleChange = (e) => {
    const { value } = e.target;
    setSearch(value);
    const query = `{
      search(titleContains: "${search}"){
        id
        title
        year
        description
        runtime
      }
    }`;
    fetch(`${process.env.REACT_APP_URL}/v1/graphql`, {
      method: "post",
      body: query,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ data }) => {
        console.log(data);
        setState({ movies: data.search, loading: false, clear: false });
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("successfully aborted");
        } else {
          console.log(err);
          // setError(err);
        }
      });
  };

  return (
    <div className="field has-addons">
      <div className="control is-expanded">
        <input
          className="input"
          type="text"
          placeholder="Find a movie title"
          value={search}
          // name="searchTerm"
          onChange={handleChange}
        />
      </div>
      <div className="control">
        <button
          className="button is-danger"
          onClick={() => {
            setState((prev) => ({ ...prev, clear: !prev.clear }));
            setSearch("");
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
