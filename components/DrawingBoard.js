import React, { useRef, useEffect, useState } from "react";

function DrawingBoard({ socket }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);

  useEffect(() => {
    socket.on("receive_drawing", (data, mouse, height, width) => {
      if (mouse === "mousemove") {
        if (canvasRef.current) {
          data[0].y = data[0].y * (canvasRef.current.clientHeight / height);
          data[0].x = data[0].x * (canvasRef.current.clientWidth / width);
          setCurrentPath((prevPath) => [...prevPath, ...data]);
        }
      } else if (mouse === "mousedown") {
        if (canvasRef.current) {
          data[0].y = data[0].y * (canvasRef.current.clientHeight / height);
          data[0].x = data[0].x * (canvasRef.current.clientWidth / width);
          setCurrentPath(data);
        }
      } else if (mouse === "mouseup") {
        if (canvasRef.current) {
          setCurrentPath([]);
          data.forEach((item) => {
            item.y = item.y * (canvasRef.current.clientHeight / height);
            item.x = item.x * (canvasRef.current.clientWidth / width);
          });
          setPaths((prevPaths) => [...prevPaths, data]);
        }
      }
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = canvas.parentNode.clientWidth;
    canvas.height = canvas.parentNode.clientHeight;

    function handleMouseDown(event) {
      setIsDrawing(true);
      const { offsetX, offsetY } = event;
      socket.emit(
        "send_drawing",
        [{ x: offsetX, y: offsetY }],
        "mousedown",
        canvasRef.current.clientHeight,
        canvasRef.current.clientWidth
      );
      setCurrentPath([{ x: offsetX, y: offsetY }]);
    }

    function handleMouseMove(event) {
      if (!isDrawing) return; // Stop if not drawing

      const { offsetX, offsetY } = event;

      if (isDrawing) {
        socket.emit(
          "send_drawing",
          [{ x: offsetX, y: offsetY }],
          "mousemove",
          canvasRef.current.clientHeight,
          canvasRef.current.clientWidth
        );
        setCurrentPath((prevPath) => [...prevPath, { x: offsetX, y: offsetY }]);
      }
    }

    function handleMouseUp() {
      setIsDrawing(false);
      socket.emit(
        "send_drawing",
        currentPath,
        "mouseup",
        canvasRef.current.clientHeight,
        canvasRef.current.clientWidth
      );
      setPaths((prevPaths) => [...prevPaths, currentPath]);
      setCurrentPath([]);
    }
    function handleMouseOut() {
      setIsDrawing(false);
      socket.emit(
        "send_drawing",
        currentPath,
        "mouseup",
        canvasRef.current.clientHeight,
        canvasRef.current.clientWidth
      );
      setPaths((prevPaths) => [...prevPaths, currentPath]);
      setCurrentPath([]);
    }

    function draw() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#000"; // Set stroke color
      context.lineJoin = "round"; // Set line join style
      context.lineWidth = 5; // Set line width

      paths.forEach((path) => {
        if (path.length > 1) {
          context.beginPath();
          context.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
          }
          context.stroke();
        }
      });

      // Draw current path
      if (currentPath.length > 1) {
        context.beginPath();
        context.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          context.lineTo(currentPath[i].x, currentPath[i].y);
        }
        context.stroke();
      }
    }

    // Redraw when paths or isDrawing changes
    draw();

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseOut);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing, paths, currentPath]);

  return (
    <canvas
      ref={canvasRef}
      // width={600}
      className="bg-white h-full w-full rounded"
    />
  );
}

export default DrawingBoard;
