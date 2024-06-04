import { useRef } from "react";
import anime from "animejs";
import Spline from "@splinetool/react-spline";

function App() {
  const spline = useRef();
  const pig = useRef();
  function onLoad(splineApp) {
    // save the app in a ref for later use
    spline.current = splineApp;
    pig.current = splineApp.findObjectByName("pig");
    window.pig = pig;
  }

  window.addEventListener("message", (event) => {
    if (!event.origin.includes("snap")) {
      return;
    }
    let data = JSON.parse(event.data);
    if (data[0] === "position") {
      let position = data.slice(2);
      const newPosition = { ...window.pig.current.position };
      newPosition.x += position[0];
      newPosition.y += position[1];
      newPosition.z += position[2];
      anime({
        targets: window.pig.current.position,
        ...newPosition,
        duration: data[1],
      });
    }

    if (data[0] === "rotation") {
      let rotation = data.slice(2);
      console.log(window.pig.current.rotation.x);
      window.pig.current.rotation.x += rotation[0] * (Math.PI / 180);
      window.pig.current.rotation.y += rotation[1] * (Math.PI / 180);
      window.pig.current.rotation.z += rotation[2] * (Math.PI / 180);
    }

  });

  function onKeyDown(e) {
    let msg = "KeyDown: s(shake)"
    console.log(window.parent.postMessage(msg, "*"));
  }

  function onMouseDown(e) {
    let msg = "MouseDown"
    console.log(window.parent.postMessage(msg, "*"));
  }

  return (
    <Spline
      scene="https://prod.spline.design/nO5gRl8xdZ5gp4UJ/scene.splinecode"
      onLoad={onLoad}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
    />
  );
}

export default App