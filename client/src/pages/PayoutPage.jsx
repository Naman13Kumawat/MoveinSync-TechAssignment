import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/User";
import { Button, Switch } from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

export default function PayoutPage() {
  const { id } = useParams();
  console.log("id", id);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("currUser"));
    if (items) {
      setUser(items);
    }

    (async () => {
      const url = `http://localhost:4000/getSheetData/row/${id}`;
      try {
        const res = await axios.get(url);
        console.log(res.data);
        if (
          res.data.PayoutLink === "Claimed" ||
          res.data.PayoutLink === "Not approved"
        ) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!!user.Number) {
      setFundAcc({
        ...fund_account,
        contact: {
          ...fund_account.contact,
          name: user.Name,
          contact: user.Number,
        },
      });
    }
  }, [user]);
  const [fund_account, setFundAcc] = useState({
    account_type: "bank_account",
    bank_account: {
      name: "",
      ifsc: "",
      account_number: "",
    },
    contact: {
      name: "",
      contact: "",
      type: "self",
    },
  });

  const updateSheet = async () => {
    const data = {
      action: "",
      id: id,
      toUpdate: "pay",
    };

    const url = "http://localhost:4000/updateSheetData";
    try {
      const res = await axios.post(url, data);
      if (res.data.success) {
        console.log(res.data.message);
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    if (
      fund_account.bank_account.name &&
      fund_account.bank_account.ifsc &&
      fund_account.bank_account.account_number
    ) {
      try {
        const res = await axios.post(
          "http://localhost:4000/payout",
          fund_account
        );
        if (res.status === 200) {
          updateSheet();
          toast.success(`Payment successful.`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          console.log(res.data);
        }
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("All fields are required!");
    }
  };
  console.log(fund_account);
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <h1>PayoutPage</h1>
      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "27ch" },
        }}
        autoComplete="off"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        Personal Details
        {!!user.Number ? (
          <>
            <TextField
              id="fname"
              label="Full Name"
              variant="filled"
              defaultValue={user.Name}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="contact"
              label="Contact"
              variant="filled"
              defaultValue={user.Number}
              InputProps={{
                readOnly: true,
              }}
            />
          </>
        ) : null}
        Bank Account Details:
        <div>
          <Switch
            onChange={() => {
              setFundAcc({
                ...fund_account,
                bank_account: {
                  ...fund_account.bank_account,
                  name: user.Name,
                },
              });
            }}
          />
          Same as above
        </div>
        <TextField
          id="accHolderName"
          required
          label="Account Holder's Name"
          variant="filled"
          value={fund_account.bank_account.name}
          onChange={(e) => {
            setFundAcc({
              ...fund_account,
              bank_account: {
                ...fund_account.bank_account,
                name: e.target.value,
              },
            });
          }}
        />
        <TextField
          id="accNum"
          required
          label="Account Number"
          variant="filled"
          onChange={(e) => {
            setFundAcc({
              ...fund_account,
              bank_account: {
                ...fund_account.bank_account,
                account_number: e.target.value,
              },
            });
          }}
        />
        <TextField
          id="ifsCode"
          required
          label="IFSC"
          variant="filled"
          onChange={(e) => {
            setFundAcc({
              ...fund_account,
              bank_account: {
                ...fund_account.bank_account,
                ifsc: e.target.value,
              },
            });
          }}
        />
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </div>
  );
}
