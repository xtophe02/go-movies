package main

import (
	"backend/models"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
)

func (app *application) getOneMovie(rw http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.logger.Println(errors.New("invalid id parameter"))
		app.errorJSON(rw, err)
		return
	}
	movie, err := app.models.DB.Get(id)
	if err != nil {
		app.logger.Println(err)
	}

	err = app.writeJSON(rw, http.StatusOK, movie, "movie")
	if err != nil {
		app.errorJSON(rw, err)
	}

}
func (app *application) getAllMovies(rw http.ResponseWriter, r *http.Request) {
	movies, err := app.models.DB.All()
	if err != nil {
		app.logger.Println(err)
	}
	err = app.writeJSON(rw, http.StatusOK, movies, "movies")
	if err != nil {
		app.errorJSON(rw, err)
	}
}
func (app *application) getAllGenres(rw http.ResponseWriter, r *http.Request) {
	genres, err := app.models.DB.AllGenres()
	if err != nil {
		app.logger.Println(err)
	}
	err = app.writeJSON(rw, http.StatusOK, genres, "genres")
	if err != nil {
		app.errorJSON(rw, err)
	}
}
func (app *application) getAllMoviesByGenreID(rw http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	id, err := strconv.Atoi(params.ByName("genre_id"))
	if err != nil {
		app.logger.Println(errors.New("invalid id parameter"))
		app.errorJSON(rw, err)
		return
	}
	// movies,err := app.models.DB.MoviesByGenreID(id)
	movies, err := app.models.DB.All(id)
	if err != nil {
		app.logger.Println(err)
	}
	err = app.writeJSON(rw, http.StatusOK, movies, "movies")
	if err != nil {
		app.errorJSON(rw, err)
	}
}
func (app *application) deleteMovie(rw http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.logger.Println(errors.New("invalid id parameter"))
		app.errorJSON(rw, err)
		return
	}
	err = app.models.DB.DeleteMovie(id)
	if err != nil {
		app.logger.Println(err)
	}

	ok := jsonResp{
		OK:      true,
		Message: "Successful",
	}
	err = app.writeJSON(rw, http.StatusOK, ok, "response")
	if err != nil {
		app.errorJSON(rw, err)
	}
}

type MoviePayload struct {
	ID          int            `json:"id"`
	Title       string         `json:"title"`
	Year        int            `json:"year"`
	Runtime     int            `json:"runtime"`
	Rating      int            `json:"rating"`
	MPAARating  string         `json:"mpaa_rating"`
	ReleaseDate string         `json:"release_date"`
	Genres      map[int]string `json:"genres"`
	Description string         `json:"description"`
}

type jsonResp struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

func (app *application) editMovie(rw http.ResponseWriter, r *http.Request) {

	var payload MoviePayload
	var movie models.Movie

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		app.errorJSON(rw, err)
		return
	}

	if payload.ID != 0 {
		m, _ := app.models.DB.Get(payload.ID)
		movie = *m
		movie.UpdatedAt = time.Now()
		// fmt.Println(payload.Genres)
	}
	movie.ID = payload.ID
	movie.Title = payload.Title
	movie.Year = payload.Year
	movie.Runtime = payload.Runtime
	movie.Rating = payload.Rating
	movie.MPAARating = payload.MPAARating
	movie.ReleaseDate, _ = time.Parse("2006-01-02T15:04:05Z07:00", payload.ReleaseDate)

	// fmt.Println(payload.Genres)
	for a := range payload.Genres {
		if _, ok := movie.MovieGenre[a]; ok {
			delete(payload.Genres, a)
		}

	}
	// fmt.Println(payload.Genres)
	movie.MovieGenre = payload.Genres

	movie.Description = payload.Description
	movie.CreatedAt = time.Now()
	movie.UpdatedAt = time.Now()

	if movie.Poster == "" {
		movie = getPoster(movie)
		fmt.Println(movie.Poster)
	}

	if movie.ID == 0 {
		err = app.models.DB.InsertMovie(&movie)
		if err != nil {
			app.errorJSON(rw, err)
			return
		}

	} else {
		err = app.models.DB.UpdateMovie(&movie)
		if err != nil {
			app.errorJSON(rw, err)
			return
		}

	}

	// fmt.Println("payload", payload.ReleaseDate)
	// fmt.Println("movie", movie.ReleaseDate)

	ok := jsonResp{
		OK:      true,
		Message: "Successful",
	}
	err = app.writeJSON(rw, http.StatusOK, ok, "response")
	if err != nil {
		app.errorJSON(rw, err)
	}
}

func getPoster(movie models.Movie) models.Movie {

	type TheMovieDB struct {
		Page    int `json:"page"`
		Results []struct {
			Adult            bool    `json:"adult"`
			BackdropPath     string  `json:"backdrop_path"`
			GenreIds         []int   `json:"genre_ids"`
			ID               int     `json:"id"`
			OriginalLanguage string  `json:"original_language"`
			OriginalTitle    string  `json:"original_title"`
			Overview         string  `json:"overview"`
			Popularity       float64 `json:"popularity"`
			PosterPath       string  `json:"poster_path"`
			ReleaseDate      string  `json:"release_date,omitempty"`
			Title            string  `json:"title"`
			Video            bool    `json:"video"`
			VoteAverage      float64 `json:"vote_average"`
			VoteCount        int     `json:"vote_count"`
		} `json:"results"`
		TotalPages   int `json:"total_pages"`
		TotalResults int `json:"total_results"`
	}
	client := &http.Client{}
	apiKey := os.Getenv("MOVIE_API_KEY")

	theUrl := fmt.Sprintf("https://api.themoviedb.org/3/search/movie?api_key=%s&query=%s", apiKey, url.QueryEscape(movie.Title))
	fmt.Println(theUrl)
	req, err := http.NewRequest("GET", theUrl, nil)
	if err != nil {
		log.Println("http new request", err)
		return movie
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Println("client do req", err)
		return movie
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("body bytes", err)
		return movie
	}

	var responseObject TheMovieDB

	json.Unmarshal(bodyBytes, &responseObject)

	if len(responseObject.Results) > 0 {
		movie.Poster = responseObject.Results[0].PosterPath
	}

	return movie
}
