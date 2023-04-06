import { useContext, useEffect, useState } from "react";
import WebcamComponent from "../components/WebcamComponent";
import axios from "axios";
import { UserContext } from "../context/User";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [img1, setImg1] = useState(null);
  const [img2, setImg2] = useState(null);
  const [img3, setImg3] = useState(null);
  const [img4, setImg4] = useState(null);
  const [web1Enable, setW1E] = useState(false);
  const [web2Enable, setW2E] = useState(false);
  const [web3Enable, setW3E] = useState(false);
  const [web4Enable, setW4E] = useState(false);
  const [links, setLinks] = useState([]);
  const [isUpld, setIsUpld] = useState(false);
  const s1 = {
    border: "solid #000",
    padding: "2rem",
    textAlign: "center",
    margin: "2rem auto",
    maxWidth: "600px",
  };

  const uploadToS3 = async (image, view) => {
    const fileName = `image-${view}-${Date.now()}.jpeg`;

    const data = {
      image: image,
      fileName: fileName,
    };

    const config = {
      method: "post",
      url: "http://localhost:4000/upload",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        setLinks((prevValue) => {
          return [...prevValue, response.data.Location];
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleSubmit = async () => {
    if (!(img1 && img2 && img3 && img4)) {
      window.alert("All pictures are required!");
    } else {
      const images = [
        {
          img: img1,
          view: "front",
        },
        {
          img: img2,
          view: "left",
        },
        {
          img: img3,
          view: "right",
        },
        {
          img: img4,
          view: "back",
        },
      ];
      images.forEach(async (imgObj) => {
        await uploadToS3(imgObj.img, imgObj.view);
      });
      setIsUpld(true);
    }
  };

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("currUser"));
    if (items) {
      setUser(items);
    }
  }, []);

  useEffect(() => {
    async function postData() {
      console.log("in post data", user);
      const data = JSON.stringify(user);

      const config = {
        method: "post",
        url: "http://localhost:4000/postSheetData",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          console.log(response.data);
          navigate("/dashboard");
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    if (Object.keys(user).length > 2) {
      postData();
    }
  }, [user]);

  const handleNext = async () => {
    const month = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const d = new Date();

    let mntName = month[d.getMonth()];
    await setUser((prevValue) => {
      return {
        ...prevValue,
        Links: links,
        Approval: "Pending",
        PayoutLink: "Pending",
        UploadMonth: mntName,
        UploadDateTime: d.toString(),
      };
    });
  };

  console.log(user);
  const imgUpd = [
    {
      img: img1,
      setImg: setImg1,
      we: web1Enable,
      weF: setW1E,
      text: "Add Front view with Cab registration visible",
    },
    {
      img: img2,
      setImg: setImg2,
      we: web2Enable,
      weF: setW2E,
      text: "Side left view with both gates visible",
    },
    {
      img: img3,
      setImg: setImg3,
      we: web3Enable,
      weF: setW3E,
      text: "Side right view with both gates visible",
    },
    {
      img: img4,
      setImg: setImg4,
      we: web4Enable,
      weF: setW4E,
      text: "Back of the car with cab registration visible",
    },
  ];
  return (
    <div>
      <h1>Upload</h1>
      {imgUpd.map((card, index) => {
        return (
          <div key={index} style={s1}>
            {card.we ? (
              <WebcamComponent
                img={card.img}
                setImg={card.setImg}
                isUpld={isUpld}
              />
            ) : (
              <>
                <button
                  onClick={() => {
                    card.weF(!card.we);
                  }}
                >
                  +
                </button>
                <p>{card.text}</p>
              </>
            )}
          </div>
        );
      })}
      <div style={{ textAlign: "center" }}>
        <button
          style={{ margin: "2rem", backgroundColor: isUpld ? "green" : null }}
          onClick={handleSubmit}
          disabled={isUpld}
        >
          {isUpld ? "Uploaded" : "Upload"}
        </button>
        {isUpld && (
          <button style={{ margin: "2rem" }} onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
