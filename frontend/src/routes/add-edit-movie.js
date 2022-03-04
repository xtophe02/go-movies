import React, { useState, useEffect } from "react";
import Alert from "../components/alert";
import Form from "../components/form";
import { Link, useNavigate } from "react-router-dom";
import DeleteModal from "../components/delete-modal";
import { useStateCtx } from "../context/use-context";

const LazyMovies = React.lazy(() => import("../components/lazy-movies-edit"));

const initValues = {
  id: 0,
  title: "",
  release_date: "",
  runtime: "",
  mpaa_rating: "",
  rating: "",
  description: "",
  genres: {},
  year: "",
  errors: null,
  alert: null,
  loading: true,
};

export default function AddEditMovie() {
  const { jwt } = useStateCtx();
  const navigate = useNavigate();

  const [state, setState] = useState(initValues);
  const [edit, setEdit] = useState(null);
  const [modal, setModal] = useState({ title: "", id: "", open: false });

  const handlerChange = (e) => {
    if (!e.target) {
      const date = new Date(e).toISOString();
      setState((prev) => ({ ...prev, release_date: date }));
      return;
    }
    const { name, value } = e.target;
    if (name === "genres") {
      const [id, tag] = e.target.value.split("-");
      if (id === "0") {
        return;
      }

      let newObj = state.genres;
      // console.log(Object.values(newObj).indexOf(tag) > -1);
      if (Object.values(newObj).indexOf(tag) > -1) {
        return;
      }
      newObj[id] = tag;
      setState((prev) => ({ ...prev, [name]: newObj }));
      return;
    }
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setState((prev) => ({ ...prev, errors: null, loading: true }));
    let flag = false;
    let arrErrors = [];
    Object.keys(state).map((st) => {
      if (st === "poster") {
        return;
      }
      if (state[st] === "") {
        arrErrors = [...arrErrors, st];
        flag = true;
        return null;
      }
      return null;
    });

    if (flag) {
      setState((prev) => ({ ...prev, errors: arrErrors, loading: false }));
    } else {
      const opt = {
        method: "POST",
        body: JSON.stringify({
          id: state.id,
          description: state.description,
          title: state.title,
          year: parseInt(state.year),
          rating: parseInt(state.rating),
          runtime: parseInt(state.runtime),
          release_date: state.release_date.toString(),
          mpaa_rating: state.mpaa_rating,
          genres: state.genres,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      };
      // console.log(opt.body);
      const res = await fetch(
        `${process.env.REACT_APP_URL}/v1/admin/editmovie`,
        opt
      );

      console.log(res);
      const json = await res.json();
      if (res.ok) {
        // setState(initValues);
        // setEdit(0);
        setState((prev) => ({
          ...prev,
          errors: null,
          loading: false,
          alert: {
            ...prev.alert,
            type: "is-success",
            message: json.response.message,
          },
        }));
      } else {
        console.log(json.error.message);
        setState((prev) => ({
          ...prev,
          errors: null,
          loading: false,
          alert: {
            ...prev.alert,
            type: "is-danger",
            message: json.error.message,
            // message: res.statusText,
          },
        }));
      }
    }
  };
  const deleteTag = (e, name) => {
    e.preventDefault();

    const newGenres = state.genres;
    delete newGenres[name];
    // console.log(state.genres);
    // console.log(newGenres);
    setState((prev) => ({ ...prev, genres: newGenres }));
  };
  useEffect(() => {
    if (jwt === "") {
      navigate("/login");
    }

    const controller = new AbortController();
    const signal = controller.signal;
    if (edit > 0) {
      console.log("fetch");
      fetch(`${process.env.REACT_APP_URL}/v1/movie/${edit}`, { signal: signal })
        .then((res) => res.json())
        .then((res) => setState({ ...res.movie, errors: null, loading: false }))
        .catch((err) => {
          console.log("CATCH", err);
          setState({ ...initValues, errors: err });
        });
    }

    setState({ ...initValues, errors: null, loading: false });
    return () => {
      console.log("aborted");

      setState(initValues);
      controller.abort();
    };
  }, [edit, jwt, navigate]);

  if (state.loading) {
    return <p>loading...</p>;
  }

  return (
    <section className="hero">
      <div className="hero-body">
        <div className="level">
          <p className="title level-left">Add/Edit Movie</p>

          <div className="select level-right">
            <select onChange={(e) => setEdit(e.target.value)}>
              <option value={0}>New...</option>
              <React.Suspense fallback={<>...</>}>
                <LazyMovies />
              </React.Suspense>
            </select>
          </div>
        </div>
        {state.alert && (
          <Alert type={state.alert.type} message={state.alert.message} />
        )}
        <div className="content">
          <form onSubmit={handleSubmit}>
            <Form
              handlerChange={handlerChange}
              state={state}
              deleteTag={deleteTag}
            />
            <div className="field is-grouped is-grouped-right">
              <p className="control">
                <button className="button is-primary" type="submit">
                  Save
                </button>
              </p>
              <p className="control">
                <Link to="/admin" className="button is-light">
                  Cancel
                </Link>
              </p>
              {state.id > 0 && (
                <p className="control">
                  <button
                    type="button"
                    className="button is-danger"
                    onClick={() =>
                      setModal((prev) => ({
                        ...prev,
                        title: state.title,
                        id: state.id,
                        open: !prev.open,
                      }))
                    }
                  >
                    Delete
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
      {modal.open && <DeleteModal modal={modal} setModal={setModal} />}
    </section>
  );
}
