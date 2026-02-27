import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

const CameraInput = ({ label, name, setFile, error }) => {
  const webcamRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const startCamera = () => setCameraOn(true);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();

    const img = new Image();
    img.onload = () => {
      const realWidth = img.naturalWidth;
      const realHeight = img.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = realWidth;
      canvas.height = realHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, realWidth, realHeight);

      // ✅ 0.75 quality — visually sharp, ~50% smaller file = faster upload
      const QUALITY = 0.75;

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], `${name || "photo"}.jpg`, {
            type: "image/jpeg",
          });

          setFile(file);

          setImgDimensions({ width: realWidth, height: realHeight });
          setPreview(canvas.toDataURL("image/jpeg", QUALITY));
          setCameraOn(false);
        },
        "image/jpeg",
        QUALITY
      );
    };

    img.src = imageSrc;
  }, [name, setFile]);

  const retake = () => {
    setPreview(null);
    setImgDimensions({ width: 0, height: 0 });
    setCameraOn(true);
  };

  return (
    <div className="form-group">
      <label>{label}</label>

      {!cameraOn && !preview && (
        <button type="button" onClick={startCamera} className="camera-btn">
          📷 Open Camera
        </button>
      )}

      {cameraOn && (
        <>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4/3",
              backgroundColor: "#000",
              overflow: "hidden",
              borderRadius: "8px",
            }}
          >
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.75} // ✅ reduced from 1.0
              videoConstraints={{
                facingMode,
                width: { ideal: 1280 },  // ✅ reduced from 1920
                height: { ideal: 720 },  // ✅ reduced from 1080
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={switchCamera} className="switch-btn">
              🔄 Switch Camera
            </button>
            <button type="button" onClick={capture} className="capture-btn">
              📸 Capture
            </button>
          </div>
        </>
      )}

      {preview && (
        <>
          <div
            style={{
              width: "100%",
              overflow: "hidden",
              borderRadius: "8px",
            }}
          >
            <img
              src={preview}
              alt="preview"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>

          {imgDimensions.width > 0 && (
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              📐 {imgDimensions.width} × {imgDimensions.height} px
            </p>
          )}

          <button type="button" onClick={retake} className="retake-btn">
            🔄 Retake
          </button>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default CameraInput;