import "./CrashGame.css";
import { ProjectImages } from "../assets/Constants";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

gsap.registerPlugin(useGSAP);

function CrashGame() {
  const container = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(false);
  const [angle, setAngle] = useState(-25);
  const planeTween = useRef<gsap.core.Tween | null>(null);
  const planeStopTween = useRef<gsap.core.Tween | null>(null);
  const bgTween = useRef<gsap.core.Tween | null>(null);
  const [backgroundPos, setBackgroundPos] = useState("-10500px 0px")

  useGSAP(
    () => {
      console.log(angle);

      if (start) {
       planeStopTween.current = gsap.to(".box", {
          x: 500,
          y: 0,
          // rotation: angle,
          duration: 7,
        });

        bgTween.current = gsap.to(".background-image", {
          duration: 30,
          backgroundPosition: backgroundPos,
          ease: "none",
          repeat: -1,
        });
      }
    },
    { dependencies: [start], scope: container }
  );

  function handleClick() {
    setStart(true);
    console.log("button clicked...");
  }

  function changeAngle() {
    console.log("change angle button");
    setAngle(50);

    if (planeTween.current) {
      planeTween.current.kill();
    }
    planeTween.current = gsap.to(".box", {
      rotation: angle,
      // y: -200,
      duration: 5,
      ease: "power1.out",
    });
  }

  function handleCrash() {
    if(start){
    if (bgTween.current) {
      bgTween.current.kill();
    }
    if(planeStopTween.current){
      planeStopTween.current.kill();
      }
    console.log("stopped...");
}  }

  return (
    <div className="game-wrapper">
      <div className="game-container">
        <div ref={container} className="game-display-container">
          <div className="background-image" />

          <div className="game-display">
            <img src={ProjectImages.PLANE} className="box plane" />
          </div>
        </div>

        <div className="game-info">
          {/* <p>game info will be here</p> */}
          <Formik
            initialValues={{
              betAmount: "",
              cashoutAt: "",
            }}
            validationSchema={Yup.object({
              betAmount: Yup.number().required("Required"),
              cashoutAt: Yup.number().required("Required"),
            })}
            onSubmit={() => console.log("submitted")}
          >
            <Form className="form-container">
              <label htmlFor="betAmount">Bet Amount</label>
              <Field
                name="betAmount"
                className="input-field"
                type="number"
                min={0}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key == "-" || e.key == "e") {
                    e.preventDefault();
                    console.log("e or - pressed ");
                  }
                }}
              />
              <ErrorMessage
                name="betAmount"
                component="div"
                className="error-message"
              />
              <br />

              <label htmlFor="cashoutAt">Cashout At</label>
              <Field
                name="cashoutAt"
                className="input-field"
                type="number"
                min={1}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key == "-" || e.key == "e") {
                    e.preventDefault();
                    console.log("e or - pressed ");
                  }
                }}
              />
              <ErrorMessage
                name="cashoutAt"
                component="div"
                className="error-message"
              />
              <br />
              <button type="submit" className="submit-button">
                Bet
              </button>
            </Form>
          </Formik>
          <br />
          <button onClick={handleClick}>start</button>
          <button onClick={changeAngle}>change angle</button>
          <button onClick={handleCrash}>Crash / Stop</button>
        </div>
      </div>
    </div>
  );
}
export default CrashGame;
