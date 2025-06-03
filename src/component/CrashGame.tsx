import "./CrashGame.css";
import { ProjectImages } from "../assets/Constants";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

function CrashGame() {
  const container = useRef("");
    const [start, setStart] = useState(false)

  useGSAP(
    () => {
        if(start)
        gsap.to(".box", { x: 600, y: -250, rotation : -25, repeat: -1, repeatDelay: 3, duration: 5 });
    },
    { dependencies: [start],scope: container }
  );

  function handleClick(){
    setStart(true)
    console.log("start button working")
  }

  return(
  <div className="game-wrapper">
      <div className='game-container'>

      <div ref = {container} className='game-display'>
      <img src={ProjectImages.PLANE} className="box plane"/>
      </div>

      <div className='game-info'>
          <p>game info will be here</p>
      </div>    
      <button onClick = {handleClick}>start</button>

      </div>
  </div>
  )
}
export default CrashGame;
