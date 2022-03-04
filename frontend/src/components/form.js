import FormInput from "./form-input";
import Genres from "./all-genres";

export default function Form(props) {
  const { handlerChange, state, deleteTag } = props;
  const {
    title,
    description,
    year,
    release_date,
    genres,
    mpaa_rating,
    rating,
    runtime,
    errors,
  } = state;

  return (
    <>
      <FormInput
        label="title"
        name="title"
        value={title}
        handlerChange={handlerChange}
        error={errors && errors.includes("title")}
      />
      <FormInput
        label="year"
        name="year"
        value={year}
        handlerChange={handlerChange}
        error={errors && errors.includes("year")}
        type="number"
      />
      <FormInput
        label="runtime"
        name="runtime"
        value={runtime}
        handlerChange={handlerChange}
        error={errors && errors.includes("runtime")}
        type="number"
      />
      <FormInput
        label="rating"
        name="rating"
        value={rating}
        handlerChange={handlerChange}
        error={errors && errors.includes("rating")}
        type="number"
      />
      <FormInput
        label="mpaa rating"
        name="mpaa_rating"
        value={mpaa_rating}
        handlerChange={handlerChange}
        error={errors && errors.includes("mpaa_rating")}
      />{" "}
      <Genres
        genres={genres}
        handlerChange={handlerChange}
        deleteTag={deleteTag}
      />
      <FormInput
        label="release date"
        name="release_date"
        value={release_date}
        handlerChange={handlerChange}
        type="date"
      />
      {/* <FormInput
        label="genres"
        name="genres"
        value={genres}
        handlerChange={handlerChange}
        error={errors && errors.includes("genres")}
        /> */}
      <FormInput
        label="description"
        name="description"
        value={description}
        handlerChange={handlerChange}
        error={errors && errors.includes("description")}
      />
    </>
  );
}
