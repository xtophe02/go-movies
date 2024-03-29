package main

import (
	"context"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/justinas/alice"
)

// add params to httprouter
func (app *application) wrap(next http.Handler) httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		ctx := context.WithValue(r.Context(), "params", p)
		next.ServeHTTP(rw, r.WithContext(ctx))
	}
}

func (app *application) routes() http.Handler {
	router := httprouter.New()
	secure := alice.New(app.checkToken)

	router.HandlerFunc(http.MethodPost, "/v1/graphql", app.moviesGraphql)

	router.HandlerFunc(http.MethodPost, "/v1/signin", app.Signin)
	router.HandlerFunc(http.MethodGet, "/status", app.statusHandler)
	router.HandlerFunc(http.MethodGet, "/v1/movie/:id", app.getOneMovie)
	router.HandlerFunc(http.MethodGet, "/v1/movies", app.getAllMovies)
	router.HandlerFunc(http.MethodGet, "/v1/genres", app.getAllGenres)
	// router.HandlerFunc(http.MethodGet,"/v1/movies/:genre_id",app.getAllMoviesByGenreID)
	router.HandlerFunc(http.MethodGet, "/v1/movies/:genre_id", app.getAllMoviesByGenreID)

	router.POST("/v1/admin/editmovie", app.wrap(secure.ThenFunc(app.editMovie)))
	// router.HandlerFunc(http.MethodPost, "/v1/admin/editmovie", app.editMovie)
	router.HandlerFunc(http.MethodGet, "/v1/admin/deletemovie/:id", app.deleteMovie)

	return app.enableCORS(router)
}
