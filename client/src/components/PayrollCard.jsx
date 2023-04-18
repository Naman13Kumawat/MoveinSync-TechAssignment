import { Link } from "react-router-dom";
import "./PayrollCard.css";
import { Button } from "@mui/material";

export default function PayrollCard(props) {
  const { element, index, mntName } = props;
  return (
    <div className="payroll_card">
      <span>
        <h1 className="title">Upload Month:</h1>
        <h1 className="value">{element.UploadMonth}</h1>
      </span>
      <span>
        <h1 className="title">Uploaded On:</h1>
        <h1 className="value">{element.UploadDateTime}</h1>
      </span>
      <span>
        <h1 className="title">Approval:</h1>
        <h1 className="value">{element.Approval}</h1>
      </span>
      <span>
        <h1 className="title">Payout Link:</h1>
        {element.Approval.toLowerCase() === "approved" &&
        element.PayoutLink.toLowerCase() !== "claimed" ? (
          <Link to={element.PayoutLink}>Payout Link</Link>
        ) : (
          <h1 className="value">{element.PayoutLink}</h1>
        )}
      </span>
      {element.PayoutLink.toLowerCase() === "not approved" &&
      element.UploadMonth === mntName &&
      index === 0 ? (
        <span>
          <Link to="/upload">
            <Button variant="contained">Upload Again</Button>
          </Link>
        </span>
      ) : null}
      <span>
        <h1 className="title">Links:</h1>
      </span>
      <span>
        {element.Links.split(",").map((link, index) => {
          return (
            <a href={link} className="title" key={index}>{`Photo${
              index + 1
            }`}</a>
          );
        })}
      </span>
    </div>
  );
}
