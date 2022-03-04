import { NavLink } from "react-router-dom";
import Navbar from "./navbar";
import { useStateCtx } from "../context/use-context";

export default function Layout(props) {
  const { children } = props;
  const { jwt } = useStateCtx();
  // console.log("JWT", jwt);
  return (
    <main className="container">
      <Navbar />
      <hr />
      <div className="columns">
        <div className="column is-2">
          <aside className="menu">
            <ul className="menu-list">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? "is-active" : null)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/movies"
                  className={({ isActive }) => (isActive ? "is-active" : null)}
                >
                  Movies REST API
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/movies-graphql"
                  className={({ isActive }) => (isActive ? "is-active" : null)}
                >
                  Movies GRAPHQL API
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/genres"
                  className={({ isActive }) => (isActive ? "is-active" : null)}
                >
                  Genres
                </NavLink>
              </li>
              {jwt !== "" && (
                <>
                  {" "}
                  <li>
                    <NavLink
                      to="/add-edit-movie"
                      className={({ isActive }) =>
                        isActive ? "is-active" : null
                      }
                    >
                      Add/Edit Movie
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        isActive ? "is-active" : null
                      }
                    >
                      Manage Catalogue
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </aside>
        </div>
        <div className="column is-10">{children}</div>
      </div>
    </main>
  );
}
