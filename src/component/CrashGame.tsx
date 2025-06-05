import "./CrashGame.css";
import { ProjectImages } from "../assets/Constants";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

gsap.registerPlugin(useGSAP);

function CrashGame() {
  const container = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(false);
  const bgTween = useRef<gsap.core.Tween | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [stop, setStop] = useState(false);
  const [showMultiplier, setShowMultiplier] = useState(1);

  useEffect(() => {
    tl.current = gsap.timeline({ paused: true });
    tl.current.to(".plane", { x: 550, y: -250, duration: 9, rotation: -15 });
    // tl.current.to(".plane", { x: 550, y: -250, duration: 4, rotation: -15 }, "4");

    return () => {
      if (tl.current) tl.current.kill();
      if (bgTween.current) 
        bgTween.current.kill();
    };
  }, []);

  useGSAP(
    () => {
      if (start) {
        let crashValue = generateCrashValue();
        displayMultiplier(crashValue);
        if (tl.current) {
          tl.current.restart();
          tl.current.play();
        }

        bgTween.current = gsap.to(".background-image", {
          duration: 30,
          backgroundPosition: "-10500px 0px",
          ease: "none",
          repeat: -1,
        });
      }

      if (stop) {
        if (tl.current) {
          tl.current.pause();
        }
        if (bgTween.current) {
          bgTween.current.pause();
        }
      }
    },
    { dependencies: [start, stop], scope: container }
  );

  function handleClick() {
    setStart(true);
    setStop(false);
    console.log("button clicked...");
  }

  function handleCrash() {
    setStop(true);
    setStart(false);
    console.log("should stop");
  }

  function generateCrashValue() {
    let temp = Math.random();
    let profit = false;
    let crashValue;

    if (temp > 0.2) profit = true;

    if (profit) {
      crashValue = (temp - 0.1) * 10;
    } else crashValue = 1;

    console.log(temp);
    console.log(profit);
    console.log(crashValue);
    return crashValue;
  }

  function displayMultiplier(crashAt: number) {
    let val = 1;
    const intervalID = setInterval(() => {
      if (crashAt <= val) {
        clearInterval(intervalID);
        handleCrash();
      }
      val = val + 0.01;
      setShowMultiplier(val);
      console.log(val.toFixed(2));
    }, 10);
  }

  return (
    <>
      <div className="game-wrapper">
        <div className="game-container">
          <div ref={container} className="game-display-container">
            <div className="background-image" />

            <div className="game-display">
              <img src={ProjectImages.PLANE} className="plane" />

              <div className="bet-multiplier">
                <h2>{(start || stop)?showMultiplier.toFixed(2): 1} x</h2>
              </div>
            </div>
          </div>

          <div className="game-info">
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
            <button onClick={handleCrash}>Crash / Stop</button>
            <button onClick={generateCrashValue}>Crash at</button>
            <button>{showMultiplier.toFixed(2)}X</button>
          </div>
        </div>
      </div>
    </>
  );
}
export default CrashGame;
