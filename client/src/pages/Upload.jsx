import { useContext, useEffect, useState } from "react";
import WebcamComponent from "../components/WebcamComponent";
import axios from "axios";
import { UserContext } from "../context/User";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { Button, IconButton } from "@mui/material";

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

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("currUser"));
    if (items) {
      setUser(items);
    }
  }, []);

  const uploadToS3 = async (image, view) => {
    const fileName = `image-${view}-${Date.now()}.jpeg`;

    const data = {
      image: image,
      fileName: fileName,
    };

    const url = "/upload";
    try {
      const res = await axios.post(url, data);
      console.log(res.data);
      setLinks((prevValue) => {
        return [...prevValue, res.data.Location];
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    if (!(img1 && img2 && img3 && img4)) {
      toast.error("All pictures are required!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
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
      toast.success(`Images uploaded successfully.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setIsUpld(true);
    }
  };

  useEffect(() => {
    async function postData() {
      const url = "/postSheetData";
      try {
        const res = await axios.post(url, user);
        console.log(res.data);
        navigate("/dashboard");
      } catch (error) {
        console.log(error);
      }
    }

    if (Object.keys(user).length > 2) {
      postData();
    }
  }, [user]);

  const handleNext = async () => {
    toast.success("Entry Submitted", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
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

    const dateTime = `${d.getDate()}/${
      d.getMonth() + 1
    }/${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}`;

    let mntName = month[d.getMonth()];
    await setUser((prevValue) => {
      return {
        ...prevValue,
        Links: links,
        Approval: "Pending",
        PayoutLink: "Pending",
        UploadMonth: mntName,
        UploadDateTime: dateTime,
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
      <div className="upload_top">
        <h1>Upload</h1>
        <Link to={"/dashboard"}>
          <p>&lt; Back</p>{" "}
        </Link>
      </div>
      <div className="upload_photo_box">
        {imgUpd.map((card, index) => {
          return (
            <div key={index} className="upload_window">
              {card.we ? (
                <WebcamComponent
                  img={card.img}
                  setImg={card.setImg}
                  isUpld={isUpld}
                />
              ) : (
                <>
                  <IconButton
                    onClick={() => {
                      card.weF(!card.we);
                    }}
                  >
                    <AddAPhotoIcon />
                  </IconButton>
                  <p>{card.text}</p>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center" }}>
        <Button
          variant="contained"
          style={{ margin: "2rem" }}
          onClick={handleSubmit}
          disabled={isUpld}
        >
          {isUpld ? "Uploaded" : "Upload"}
        </Button>
        {isUpld && (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
