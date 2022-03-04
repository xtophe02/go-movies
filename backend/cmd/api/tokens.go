package main

import (
	"backend/models"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/pascaldekloe/jwt"
	"golang.org/x/crypto/bcrypt"
)

var validUser = models.User{
	ID:       10,
	Email:    "eng.christophe.moreira@gmail.com",
	Password: "fcportu",
}

type Credentials struct {
	Username string `json:"email"`
	Password string `json:"password"`
}

func (app *application) Signin(rw http.ResponseWriter, r *http.Request) {
	var c Credentials
	err := json.NewDecoder(r.Body).Decode(&c)
	if err != nil {
		app.errorJSON(rw, errors.New("json error"))
		return
	}
	hp, _ := bcrypt.GenerateFromPassword([]byte(validUser.Password), 12)
	err = bcrypt.CompareHashAndPassword([]byte(hp), []byte(c.Password))
	if err != nil {
		fmt.Println(c.Password)
		app.errorJSON(rw, errors.New("unauthorized"))
		return
	}

	var claims jwt.Claims
	claims.Subject = fmt.Sprint(validUser.ID)
	claims.Issued = jwt.NewNumericTime(time.Now())
	claims.NotBefore = jwt.NewNumericTime(time.Now())
	claims.Expires = jwt.NewNumericTime(time.Now().Add(3 * time.Hour))
	claims.Issuer = "mydomain.com"
	claims.Audiences = []string{"mydomain.com"}

	jwtBytes, err := claims.HMACSign(jwt.HS256, []byte(app.config.jwt.secret))
	if err != nil {
		app.errorJSON(rw, errors.New("error signing"))
		return
	}

	app.writeJSON(rw, http.StatusOK, string(jwtBytes), "response")
}
