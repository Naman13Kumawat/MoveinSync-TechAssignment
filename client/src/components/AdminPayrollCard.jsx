import "./PayrollCard.css";
import { Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";

export default function AdminPayrollCard(props) {
  const { element, updateApproval, sendCashgram, appPending } = props;
  return (
    <div className="payroll_card">
      <span>
        <h1 className="title">Number:</h1>
        <h1 className="value">{element.Number}</h1>
      </span>
      <span>
        <h1 className="title">Name:</h1>
        <h1 className="value">{element.Name}</h1>
      </span>
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
        {element.Approval === "Pending" ? (
          <>
            <LoadingButton
              color="success"
              onClick={() => sendCashgram(element.id)}
              loading={appPending}
              variant="contained"
            >
              Approve
            </LoadingButton>
            <Button
              color="error"
              variant="contained"
              onClick={() => updateApproval("Rejected", element.id, "")}
            >
              Reject
            </Button>
          </>
        ) : null}
      </span>
      <span>
        <h1 className="title">Payout Link:</h1>
        {element.Approval.toLowerCase() === "approved" &&
        element.PayoutLink.toLowerCase() !== "claimed" ? (
          <h1 className="value">Payout link sent</h1>
        ) : (
          <h1 className="value">{element.PayoutLink}</h1>
        )}
      </span>
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
