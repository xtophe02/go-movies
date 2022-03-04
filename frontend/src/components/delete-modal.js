import React from "react";
import { useNavigate } from "react-router-dom";

export default function DeleteModal({ modal, setModal }) {
  const navigate = useNavigate();
  const deleteMovie = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_URL}/v1/admin/deletemovie/${modal.id}`
    );
    if (res.ok) {
      setModal((prev) => ({ title: "", id: "", open: !prev.open }));
      navigate("/admin");
    }
  };
  return (
    <div className={`modal ${modal.open && "is-active"}`}>
      <div className="modal-background"></div>
      <div className="modal-content box">
        <h3 className="title">Do you realy want to delete?</h3>
        <h5 className="subtitle">{modal.title}</h5>
        <div className="field is-grouped">
          <p className="control">
            <button
              className="button"
              onClick={() =>
                setModal((prev) => ({ ...prev, open: !prev.open }))
              }
            >
              Cancel
            </button>
          </p>
          <p className="control">
            <button className="button is-danger" onClick={deleteMovie}>
              Delete Movie
            </button>
          </p>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => setModal((prev) => ({ ...prev, open: !prev.open }))}
      ></button>
    </div>
  );
}
