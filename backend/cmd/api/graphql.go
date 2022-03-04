package main

import (
	"backend/models"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/graphql-go/graphql"
)

//var to hold data
var movies []*models.Movie

type Thing map[string]interface{}

//graphql schema
var fields = graphql.Fields{
	"movie": &graphql.Field{
		Type:        movieType,
		Description: "Get movie by id",
		Args: graphql.FieldConfigArgument{
			"id": &graphql.ArgumentConfig{
				Type: graphql.Int,
			},
		},
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			id, ok := p.Args["id"].(int)
			if ok {
				for _, movie := range movies {

					if movie.ID == id {
						// return map[string]interface{}{"genre_name": []map[int]string{movie.MovieGenre}}, nil
						// return []map[string]interface{}{{"genres": movie.MovieGenre}}, nil
						// return []Thing{
						// 	{"genres": "Swamp Thing"},
						// }, nil
						return movie, nil
					}

				}
			}
			return nil, nil
		},
	},
	"untyped": &graphql.Field{
		Type: graphql.NewList(graphql.NewObject(graphql.ObjectConfig{
			Name: "Untyped",
			Fields: graphql.Fields{
				"name": &graphql.Field{Type: graphql.String},
			},
		})),
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			return []map[string]interface{}{
				{"name": "Swamp Thing"},
			}, nil
		},
	},
	"allMovies": &graphql.Field{
		Type:        graphql.NewList(movieType),
		Description: "Get all movies",
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			return movies, nil
		},
	},
	"search": &graphql.Field{
		Type:        graphql.NewList(movieType),
		Description: "search movies by title",
		Args: graphql.FieldConfigArgument{
			"titleContains": &graphql.ArgumentConfig{
				Type: graphql.String,
			},
		},
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			var moviesList []*models.Movie
			search, ok := p.Args["titleContains"].(string)
			if ok {
				// fmt.Println("SEARCH", search)
				for _, currentMovie := range movies {
					if strings.Contains(strings.ToLower(currentMovie.Title), strings.ToLower(search)) {
						moviesList = append(moviesList, currentMovie)
					}
				}
			}
			return moviesList, nil
		},
	},
}

var movieType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Movie",
	Fields: graphql.Fields{
		"id": &graphql.Field{
			Type: graphql.Int,
		},
		"title": &graphql.Field{
			Type: graphql.String,
		},
		"description": &graphql.Field{
			Type: graphql.String,
		},
		"year": &graphql.Field{
			Type: graphql.Int,
		},
		"release_date": &graphql.Field{
			Type: graphql.DateTime,
		},
		"runtime": &graphql.Field{
			Type: graphql.Int,
		},
		"rating": &graphql.Field{
			Type: graphql.Int,
		},
		// "genres": &graphql.Field{Type: movieGenre},
		"genres": &graphql.Field{
			Type: graphql.NewObject(graphql.ObjectConfig{
				Name: "Genres",
				Fields: graphql.Fields{
					"genre": &graphql.Field{
						Type: graphql.NewList(
							graphql.NewObject(graphql.ObjectConfig{
								Name: "Genre",
								Fields: graphql.Fields{
									"genre_name": &graphql.Field{Type: graphql.String},
								},
							}),
						),
					},
				},
			}),
		},
		"mpaa_rating": &graphql.Field{
			Type: graphql.String,
		},
		"created_at": &graphql.Field{
			Type: graphql.DateTime,
		},
		"updated_at": &graphql.Field{
			Type: graphql.DateTime,
		},
		"poster": &graphql.Field{
			Type: graphql.String,
		},
	},
})

func (app *application) moviesGraphql(rw http.ResponseWriter, r *http.Request) {
	movies, _ = app.models.DB.All()

	q, _ := io.ReadAll(r.Body)
	query := string(q)

	// log.Println("QUERY", query)

	rootQuery := graphql.ObjectConfig{Name: "RootQuery", Fields: fields}
	schemaConfig := graphql.SchemaConfig{Query: graphql.NewObject(rootQuery)}
	schema, err := graphql.NewSchema(schemaConfig)
	if err != nil {
		app.errorJSON(rw, errors.New("failed to create schema"))
		log.Println(err)
		return
	}
	params := graphql.Params{Schema: schema, RequestString: query}
	resp := graphql.Do(params)
	if len(resp.Errors) > 0 {
		app.errorJSON(rw, fmt.Errorf("failed: %+v", resp.Errors))
		log.Println(err)
		return
	}
	j, _ := json.MarshalIndent(resp, "", "  ")
	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(j)
}
