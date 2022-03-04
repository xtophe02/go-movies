import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./index.css";
import App from "./App";
import Movies from "./routes/movies";
import Home from "./routes/home";
import ManageCatalogue from "./routes/manage-catalogue";
import Movie from "./routes/movie";
import Genre from "./routes/genre";
import Genres from "./routes/genres";
import AddEditMovie from "./routes/add-edit-movie";
import Login from "./routes/login";
import MoviesGraphql from "./routes/movies-graphql";
import MovieGraphql from "./routes/movie-graphql";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="movies" element={<Movies />}>
          <Route path=":id" element={<Movie />} />
        </Route>
        <Route path="movies-graphql" element={<Outlet />}>
          <Route index element={<MoviesGraphql />} />
          <Route path=":id" element={<MovieGraphql />} />
        </Route>
        <Route path="genres" element={<Outlet />}>
          <Route index element={<Genres />} />
          <Route path=":id" element={<Genre />} />
        </Route>
        <Route path="add-edit-movie" element={<AddEditMovie />} />
        <Route path="admin" element={<ManageCatalogue />} />
        <Route path="login" element={<Login />} />
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Route>
    </Routes>
  </BrowserRouter>,

  document.getElementById("root")
);
