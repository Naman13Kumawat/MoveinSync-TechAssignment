import axios from "axios";
import { useEffect, useState } from "react";

export default function Admin() {
  const [sheetData, setSD] = useState([]);
  const [filteredData, setFD] = useState(sheetData);
  useEffect(() => {
    (async () => {
      const config = {
        method: "get",
        url: "http://localhost:4000/getSheetData",
      };
      try {
        const res = await axios.get(config.url);
        if (res.data.success) {
          setSD(res.data.data);
          setFD(res.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  console.log(sheetData);

  const updateApproval = async (action, id) => {
    const data = {
      action: action,
      id: id,
    };

    const config = {
      url: "http://localhost:4000/updateSheetData",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const { data } = await axios.post(config.url, config.data);
      if (data.success) {
        console.log(data.message);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const filterFunc = (value) => {
    console.log("value", value);
    if (value) {
      setFD(
        sheetData.filter((entry) => {
          return entry.Approval === value;
        })
      );
    } else {
      setFD(sheetData);
    }
  };

  return (
    <div>
      <h1>Welcome Admin</h1>
      <h2>Approval Filters:</h2>
      <button
        onClick={() => {
          filterFunc("Pending");
        }}
      >
        Pending
      </button>
      <button
        onClick={() => {
          filterFunc("Rejected");
        }}
      >
        Rejected
      </button>
      <button
        onClick={() => {
          filterFunc("Approved");
        }}
      >
        Approved
      </button>
      <button
        onClick={() => {
          filterFunc();
        }}
      >
        All
      </button>
      {filteredData.map((element) => {
        return (
          <div key={element.id}>
            <hr />
            <p>{element.id}</p>
            <p>{element.Number}</p>
            <p>{element.Name}</p>
            <div>
              <span>{element.Approval}</span>
              {element.Approval === "Pending" ? (
                <>
                  <button
                    onClick={() => updateApproval("Approved", element.id)}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateApproval("Rejected", element.id)}
                  >
                    Reject
                  </button>
                </>
              ) : null}
            </div>
            <p>{element.UploadMonth}</p>
            <p>{element.UploadDateTime}</p>
            {element.Links.split(",").map((link, index) => {
              return (
                <p key={index}>
                  <a href={link}>{`Photo ${index + 1} link`}</a>
                </p>
              );
            })}
            <p>{element.PayoutLink}</p>
            <hr />
          </div>
        );
      })}
    </div>
  );
}
