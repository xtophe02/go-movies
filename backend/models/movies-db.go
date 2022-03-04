package models

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"
)

type DBModel struct {
	DB *sql.DB
}

//return 1x movie
func (m *DBModel) Get(id int) (*Movie, error) {
	//good practice
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `select id, title, description, year, release_date, rating ,runtime, mpaa_rating,
					created_at, updated_at, coalesce(poster, '') from movies where id = $1;`

	row := m.DB.QueryRowContext(ctx, query, id)
	var movie Movie

	err := row.Scan(
		&movie.ID,
		&movie.Title,
		&movie.Description,
		&movie.Year,
		&movie.ReleaseDate,
		&movie.Rating,
		&movie.Runtime,
		&movie.MPAARating,
		&movie.CreatedAt,
		&movie.UpdatedAt,
		&movie.Poster,
	)
	if err != nil {
		return nil, err
	}
	query = `select mg.id, mg.movie_id, mg.genre_id , g.genre_name 
	from movies_genres as mg 
	left join genres as g 
	on g.id = mg.genre_id
	where mg.movie_id = $1;`

	rows, err := m.DB.QueryContext(ctx, query, id)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	genres := make(map[int]string)
	for rows.Next() {
		var mg MovieGenre
		err := rows.Scan(
			&mg.ID,
			&mg.MovieID,
			&mg.GenreID,
			&mg.Genre.GenreName,
		)
		if err != nil {
			return nil, err
		}
		genres[mg.ID] = mg.Genre.GenreName
	}

	movie.MovieGenre = genres

	return &movie, nil
}

//return all movies
func (m *DBModel) All(genre ...int) ([]*Movie, error) {
	//good practice
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	where := ""
	if len(genre) > 0 {
		where = fmt.Sprintf("where id in (select movie_id from movies_genres where genre_id = %d)", genre[0])
	}

	query := fmt.Sprintf(`select id, title, description, year, release_date, rating ,runtime, mpaa_rating,
					created_at, updated_at, coalesce(poster, '') from movies %s order by title;`, where)

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	var movies []*Movie
	for rows.Next() {
		var movie Movie
		err := rows.Scan(
			&movie.ID,
			&movie.Title,
			&movie.Description,
			&movie.Year,
			&movie.ReleaseDate,
			&movie.Rating,
			&movie.Runtime,
			&movie.MPAARating,
			&movie.CreatedAt,
			&movie.UpdatedAt,
			&movie.Poster,
		)
		if err != nil {
			return nil, err
		}

		genreQuery := `select mg.id, mg.movie_id, mg.genre_id , g.genre_name 
							from movies_genres as mg 
							left join genres as g 
							on g.id = mg.genre_id
							where mg.movie_id = $1;`

		genreRows, err := m.DB.QueryContext(ctx, genreQuery, movie.ID)
		if err != nil {
			log.Println(err)
		}

		genres := make(map[int]string)
		for genreRows.Next() {
			var mg MovieGenre
			err := genreRows.Scan(
				&mg.ID,
				&mg.MovieID,
				&mg.GenreID,
				&mg.Genre.GenreName,
			)
			if err != nil {
				return nil, err
			}
			genres[mg.ID] = mg.Genre.GenreName
		}
		genreRows.Close()
		movie.MovieGenre = genres

		movies = append(movies, &movie)
	}

	return movies, nil
}
func (m *DBModel) AllGenres() ([]*Genre, error) {
	//good practice
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `select id, genre_name from genres order by genre_name;`

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	var genres []*Genre

	for rows.Next() {
		var genre Genre
		err := rows.Scan(
			&genre.ID,
			&genre.GenreName,
		)
		if err != nil {
			return nil, err
		}
		genres = append(genres, &genre)
	}

	return genres, nil
}
func (m *DBModel) MoviesByGenreID(genreID int) ([]*Movie, error) {
	//good practice
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `select movies.id, movies.title from movies_genres 
		join movies on movies_genres.movie_id = movies.id
		where genre_id = $1;`

	rows, err := m.DB.QueryContext(ctx, query, genreID)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	var movies []*Movie

	for rows.Next() {
		var movie Movie
		err := rows.Scan(
			&movie.ID,
			&movie.Title,
		)
		if err != nil {
			return nil, err
		}
		movies = append(movies, &movie)
	}

	return movies, nil
}
func (m *DBModel) InsertMovie(movie *Movie) error {
	//good practice
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `insert into movies (title, description, year, release_date, runtime, rating, mpaa_rating, created_at, updated_at)
			values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id;`

	var newID int
	err := m.DB.QueryRowContext(ctx, query,
		movie.Title,
		movie.Description,
		movie.Year,
		movie.ReleaseDate,
		movie.Runtime,
		movie.Rating,
		movie.MPAARating,
		movie.CreatedAt,
		movie.UpdatedAt,
		movie.Poster).Scan(&newID)

	if err != nil {
		return err
	}

	if len(movie.MovieGenre) > 0 {
		for id := range movie.MovieGenre {

			genre := `insert into movies_genres (movie_id, genre_id, created_at, updated_at)
					values ($1, $2,$3,$4);`

			_, err := m.DB.ExecContext(ctx, genre, newID, id, movie.CreatedAt, movie.UpdatedAt)

			if err != nil {
				return err
			}
		}
	}
	return nil
}
func (m *DBModel) UpdateMovie(movie *Movie) error {
	//good practice
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `update movies set title = $1, 
			description = $2, 
			year = $3, 
			release_date = $4, 
			runtime = $5, 
			rating = $6, 
			mpaa_rating = $7, 
			updated_at = $8, poster = $9 where id = $10;
			`

	_, err := m.DB.ExecContext(ctx, query,
		movie.Title,
		movie.Description,
		movie.Year,
		movie.ReleaseDate,
		movie.Runtime,
		movie.Rating,
		movie.MPAARating,
		movie.UpdatedAt,
		movie.Poster,
		movie.ID)

	if err != nil {
		return err
	}

	if len(movie.MovieGenre) > 0 {
		var (
			placeholders []string
			vals         []interface{}
		)

		count := 0
		for index := range movie.MovieGenre {

			placeholders = append(placeholders, fmt.Sprintf("($%d,$%d,$%d,$%d)",
				count*4+1,
				count*4+2,
				count*4+3,
				count*4+4,
			))
			count++
			vals = append(vals, index, movie.ID, movie.CreatedAt, movie.UpdatedAt)
		}

		txn, err := m.DB.BeginTx(ctx, nil)
		if err != nil {
			fmt.Println(err)
			return err
		}

		insertStatement := fmt.Sprintf("insert into movies_genres (genre_id, movie_id, created_at, updated_at) values %s", strings.Join(placeholders, ","))
		_, err = txn.Exec(insertStatement, vals...)
		fmt.Println(insertStatement)
		if err != nil {
			txn.Rollback()
			fmt.Println(err)
			return err
		}
		//remove duplicates
		// txn.Exec(`DELETE FROM movies_genres
		// WHERE id IN
		// 		(SELECT id
		// 		FROM
		// 				(SELECT id,
		// 				 ROW_NUMBER() OVER( PARTITION BY genre_id
		// 				ORDER BY  id ) AS row_num
		// 				FROM movies_genres ) t
		// 				WHERE t.row_num > 1 );`)

		if err := txn.Commit(); err != nil {
			fmt.Println(err)
			return err
		}

		return nil

	}
	return nil
}

func (m *DBModel) DeleteMovie(id int) error {
	//good practice
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `delete from movies where id = $1;`

	_, err := m.DB.ExecContext(ctx, query, id)

	if err != nil {
		return err
	}
	return nil
}
