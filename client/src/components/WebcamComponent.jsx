import Webcam from "react-webcam";
import "./Webcam.css";
import { useCallback, useRef } from "react";
import { Button } from "@mui/material";

export default function WebcamComponent(props) {
  const { img, setImg, isUpld } = props;
  const webcamRef = useRef(null);

  const videoConstraints = {
    // width: 1080,
    // height: 1920,
    aspectRatio: 0.5625,
    facingMode: "user",
  };

  const capture = useCallback(() => {
    const base64Data = webcamRef.current.getScreenshot();
    setImg(base64Data);
  }, [webcamRef, setImg]);
  return (
    <div className="Container">
      {img === null ? (
        <>
          <Webcam
            audio={false}
            mirrored={true}
            width={"100%"}
            height={"100%"}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            videoConstraints={videoConstraints}
          />
          <Button variant="contained" className="webButton" onClick={capture}>
            Capture photo
          </Button>
        </>
      ) : (
        <>
          <img className="webImg" src={img} alt="screenshot" />
          <Button
            variant="contained"
            className="webButton"
            onClick={() => setImg(null)}
            style={{ display: isUpld ? "none" : "" }}
          >
            Retake
          </Button>
        </>
      )}
    </div>
  );
}
