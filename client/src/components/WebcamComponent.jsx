import Webcam from "react-webcam";
import "./Webcam.css";
import { useCallback, useRef } from "react";

export default function WebcamComponent(props) {
  const { img, setImg, isUpld } = props;
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 300,
    height: 400,
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
            height={400}
            width={300}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            videoConstraints={videoConstraints}
          />
          <button onClick={capture}>Capture photo</button>
        </>
      ) : (
        <>
          <img src={img} alt="screenshot" />
          <button
            onClick={() => setImg(null)}
            style={{ display: isUpld ? "none" : "" }}
          >
            Retake
          </button>
        </>
      )}
    </div>
  );
}
