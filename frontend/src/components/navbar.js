import React from "react";
import { useNavigate } from "react-router-dom";
import { useSetStateCtx, useStateCtx } from "../context/use-context";

export default function Navbar() {
  const navigate = useNavigate();
  const { jwt } = useStateCtx();
  const setJwt = useSetStateCtx();
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="#!">
          <h1 className="title pt-4">Go Watch a Movie!</h1>
        </a>

        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
          href="#!"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {jwt === "" ? (
                <button
                  className="button is-primary"
                  onClick={() => navigate("/login")}
                >
                  <strong>Log In</strong>
                </button>
              ) : (
                <button
                  className="button is-light"
                  onClick={() => {
                    setJwt({ jwt: "" });
                    window.localStorage.removeItem("jwt");
                    navigate("/login");
                  }}
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
