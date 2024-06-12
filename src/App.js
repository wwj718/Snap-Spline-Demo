import { useRef } from "react";
// import anime from "animejs";
import Spline from "@splinetool/react-spline";
import { Supervisor, Agent} from "./dynatalk-over-postmessage-es6.js";

class IframeAgent extends Agent {
  get_attribute(name, attribute) {
    // console.log(`get_attribute: ${name}, ${attribute}`)
    window.object.current = window.spline.current.findObjectByName(name);
    let value = window.object.current[attribute];
    this.respondWith([value.x, value.y, value.z]);
  }
}

function App() {

  const spline = useRef();
  const object = useRef();

  function onLoad(splineApp) {
    // save the app in a ref for later use
    spline.current = splineApp;
    window.spline = spline;
    window.object = object;
  }

  /*
  window.Agent.subclass('IframeAgent',
    'default category', {
    get_attribute: function (name, attribute) {
      // attribute: position, rotation, scale
      window.object.current = window.spline.current.findObjectByName(name);
      let value = window.object.current[attribute];
      this.respondWith([value.x, value.y, value.z]);
    },
  });
  */

  let supervisor = new Supervisor("child");
  let agent = new IframeAgent("SplineWorld");
  supervisor.addAgent(agent);

  window.addEventListener("message", (event) => {
    if (!event.origin.includes("snap")) {
      return;
    }
    let data = JSON.parse(event.data);

    let name = data[0];
    let attribute = data[1];
    window.object.current = window.spline.current.findObjectByName(name);

    if (attribute === "position") {
      let position = data.slice(2);
      // const newPosition = { ...window.object.current.position };
      window.object.current.position.x = position[0];
      window.object.current.position.y = position[1];
      window.object.current.position.z = position[2];
      /*anime({
        targets: window.object.current.position,
        ...newPosition,
        duration: data[1],
      });*/
    }

    if (attribute === "rotation") {
      let rotation = data.slice(2);
      window.object.current.rotation.x = rotation[0];
      window.object.current.rotation.y = rotation[1];
      window.object.current.rotation.z = rotation[2];
    }

    if (attribute === "scale") {
      let scale = data.slice(2);
      window.object.current.scale.x = scale[0];
      window.object.current.scale.y = scale[1];
      window.object.current.scale.z = scale[2];
    }

    if (attribute === "visible") {
      window.object.current.visible = data[2];
    }
  });

  function onKeyDown(e) {
    let event = "KeyDown: s(shake)"
    console.log(event);
    // window.parent.postMessage(event, "*")
    agent.sendTo("SnapAgent", "echo", [event]);
  }

  function onMouseDown(e) {
    let event = "MouseDown"
    console.log(event);
    // window.parent.postMessage(event, "*")
    agent.sendTo("SnapAgent", "echo", [event]);
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