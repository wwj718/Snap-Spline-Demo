import { useRef } from "react";
// import anime from "animejs";
import Spline from "@splinetool/react-spline";
import { Supervisor, Agent } from "./dynatalk-over-postmessage-es6.js";

class IframeAgent extends Agent {
  // read and modify object
  get_attribute(name, attribute_name) {
    // console.log(`get_attribute: ${name}, ${attribute}`)
    window.object.current = window.spline.current.findObjectByName(name);
    if (!window.object.current){this.raiseWith("This object does not exist"); return};
    let value = window.object.current[attribute_name];
    this.respondWith([value.x, value.y, value.z]);
  }
  set_attribute(name, attribute_name, value) {
    window.object.current = window.spline.current.findObjectByName(name);
    if (!window.object.current){this.raiseWith("This object does not exist"); return};
    if (["position", "rotation", "scale"].includes(attribute_name)) {
      window.object.current[attribute_name].x = value[0];
      window.object.current[attribute_name].y = value[1];
      window.object.current[attribute_name].z = value[2];
    }

    if (attribute_name === "visible") {
      window.object.current.visible = value[0];
    }
  }

  set_variable(var_name, value) {
    // window.spline
    window.spline.current.setVariable(var_name, value);
  }

  setBackgroundColor(value) {
    window.spline.current.setBackgroundColor(value);
  }

  getAllObjects() {
    let result = window.spline.current.getAllObjects();
    console.log("getAllObjects: ", result)
    this.respondWith([result]);
  }

  getSplineEvents(){
    this.respondWith([window.spline.current.getSplineEvents()]);
  }

  getVariables(){
    this.respondWith([window.spline.current.getVariables()]);
  }

  setZoom(value){
    window.spline.current.setZoom(value);
  }

  setSize(width, height){
    window.spline.current.setSize(width, height);
  }

  emitEvent(name, eventName){
    // mouseDown
    window.spline.current.emitEvent(eventName, name);
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
    agent.sendTo("SnapAgent", "onLoadSpline", []);
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

  function handleEvent(e) {
    let event = [e.target.name, e.type]
    console.log("event:", event);
    // window.parent.postMessage(event, "*")
    agent.sendTo("SnapAgent", "echo", [event]);
  }

  const url = new window.URL(window.location.href);
  const params = new window.URLSearchParams(url.search);
  const project = params.get('project');
  const sceneUrl = project ? project : 'https://prod.spline.design/nO5gRl8xdZ5gp4UJ/scene.splinecode';
  // const sceneUrl = 'https://prod.spline.design/nO5gRl8xdZ5gp4UJ/scene.splinecode';

  return (
    <Spline
      scene={sceneUrl}
      onLoad={onLoad}
      onKeyUp={handleEvent}
      onKeyDown={handleEvent}
      onMouseUp={handleEvent}
      onMouseDown={handleEvent}
      // onWheel={handleEvent}
      onMouseHover={handleEvent}
      // onLookAt={handleEvent}
    />
  );
}

export default App