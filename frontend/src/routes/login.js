import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/notification";
import { useSetStateCtx } from "../context/use-context";

const initValues = {
  email: "",
  password: "",
  errors: null,
  loading: false,
};

export default function Login() {
  const [state, setState] = useState(initValues);
  const setJwt = useSetStateCtx();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, errors: null, loading: true }));
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    const errors = {};
    Object.keys(payload).map((k) => {
      if (payload[k] === "") {
        errors[k] = "cannot be empty";
        return errors;
      }
      return errors;
    });

    if (Object.keys(errors).length !== 0) {
      setState((prev) => ({ ...prev, errors, loading: false }));

      return;
    } else {
      const res = await fetch(`${process.env.REACT_APP_URL}/v1/signin`, {
        method: "POST",
        body: JSON.stringify({ email: state.email, password: state.password }),
      });
      // console.log(res);
      const json = await res.json();
      if (res.ok) {
        setState((prev) => ({ ...prev, loading: false }));
        window.localStorage.setItem("jwt", JSON.stringify(json.response));
        setJwt({ jwt: json.response });
        navigate("/");
      } else {
        setState((prev) => ({
          ...prev,
          errors: json.error,
          loading: false,
        }));
      }
    }
  };

  return (
    <>
      {state.errors?.message && (
        <Notification
          type="is-danger"
          message={state.errors.message}
          setState={setState}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input
              className={`input ${state.errors?.email && "is-danger"}`}
              type="text"
              placeholder="email@example.com"
              name="email"
              value={state.email}
              onChange={(e) =>
                setState((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          {state.errors?.email && (
            <p className="help is-danger">{state.errors?.email}</p>
          )}
        </div>
        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input
              className={`input ${state.errors?.password && "is-danger"}`}
              type="password"
              name="password"
              value={state.password}
              onChange={(e) =>
                setState((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>
          {state.errors?.password && (
            <p className="help is-danger">{state.errors?.password}</p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              className={`button is-link ${state.loading && "is-loading"}`}
              type="submit"
            >
              Submit
            </button>
          </div>
          <div className="control">
            <button className="button is-link is-light">Cancel</button>
          </div>
        </div>
      </form>
    </>
  );
}
