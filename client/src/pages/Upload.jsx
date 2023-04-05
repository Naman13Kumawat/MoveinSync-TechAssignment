import { useState } from "react";
import WebcamComponent from "../components/WebcamComponent";

export default function Upload() {
  const [img1, setImg1] = useState(null);
  const [img2, setImg2] = useState(null);
  const [img3, setImg3] = useState(null);
  const [img4, setImg4] = useState(null);
  const [web1Enable, setW1E] = useState(false);
  const [web2Enable, setW2E] = useState(false);
  const [web3Enable, setW3E] = useState(false);
  const [web4Enable, setW4E] = useState(false);

  const s1 = {
    border: "solid #000",
    padding: "2rem",
    textAlign: "center",
    margin: "2rem auto",
    maxWidth: "600px",
  };

  const handleSubmit = async () => {
    if (!(img1 && img2 && img3 && img4)) {
      window.alert("All pictures are required!");
    }
    console.log(img1, img2, img3, img4);
  };

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
              <WebcamComponent img={card.img} setImg={card.setImg} />
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
      <button
        style={{ margin: "2rem auto", display: "block" }}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
