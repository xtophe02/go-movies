import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
// import DatePicker from "react-datepicker";
const DatePicker = React.lazy(() => import("react-datepicker"));

export default function FormInput(props) {
  const { label, name, value, handlerChange, error, type = "text" } = props;
  const [startDate, setStartDate] = useState(new Date());

  const inputField = (key) => {
    switch (key) {
      case "id":
        return null;

      case "release_date":
        return (
          <React.Suspense fallback={<>...</>}>
            <DatePicker
              dateFormat="dd/MM/yyyy"
              className="input"
              name="release_date"
              selected={startDate}
              onChange={(date) => {
                handlerChange(date);
                setStartDate(date);
              }}
            />
          </React.Suspense>
        );

      case "description":
        return (
          <>
            <textarea
              className={`textarea ${error && "is-danger"}`}
              name={name}
              value={value}
              onChange={handlerChange}
            ></textarea>
            {error && <p className="help is-danger">Cannot be empty</p>}
          </>
        );

      case "mpaa_rating":
        return (
          <>
            <div className={`select ${error && "is-danger"}`}>
              <select onChange={handlerChange} name="mpaa_rating" value={value}>
                <option value="">Choose...</option>
                <option value="g">G</option>
                <option value="pg">PG</option>
                <option value="pg13">PG13</option>
                <option value="R">R</option>
                <option value="nc17">NC17</option>
              </select>
            </div>
            {error && <p className="help is-danger">Cannot be empty</p>}
          </>
        );

      default:
        return (
          <>
            <input
              className={`input ${error && "is-danger"}`}
              type={type}
              name={name}
              value={value}
              onChange={handlerChange}
            />
            {error && <p className="help is-danger">Cannot be empty</p>}
          </>
        );
    }
  };

  return (
    <div className="field">
      {label !== "id" && (
        <label className="label is-capitalized">{label}</label>
      )}
      <div className="control">{inputField(name)}</div>
    </div>
  );
}
