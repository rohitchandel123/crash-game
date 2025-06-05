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
  const [balance, setBalance] = useState<number>(10000);
  const [hasCashout, setHasCashout] = useState<boolean>(false);

  let multiplierCrashValue = useRef(0);

  useEffect(() => {
    tl.current = gsap.timeline({ paused: true });
    tl.current.to(".plane", { x: 550, y: -250, duration: 9, rotation: -15 });
    // tl.current.to(".plane", { x: 550, y: -250, duration: 4, rotation: -15 }, "4");

    return () => {
      if (tl.current) tl.current.kill();
      if (bgTween.current) bgTween.current.kill();
    };
  }, []);

  useGSAP(
    () => {
      if (start) {
        setHasCashout(false);
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
    //modal show
    //amount add
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
      // console.log(val.toFixed(2));
    }, 10);
  }

  function betSubmitted(betAmount: string) {
    setStart(true);
    setStop(false);
    setBalance(balance - Number(betAmount));
  }

  function handleCashout(betAmount: number) {
    console.log("handle cashout");
    multiplierCrashValue.current = Number(showMultiplier.toFixed(2));
    setHasCashout(true);
    let winningAmount = betAmount * showMultiplier;
    console.log("winning amount is", winningAmount.toFixed(2));

    let newBalance: number = Number(balance) + Number(winningAmount.toFixed(2));
    console.log(
      `balance ${balance} ${winningAmount} = new balance ${newBalance} `
    );

    setBalance(newBalance);
    console.log(showMultiplier);
    console.log("cashout done");
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
                <h2 className={stop ? "has-crashed" : ""}>
                  {start || stop ? `${showMultiplier.toFixed(2)}X` : ""}
                </h2>

                {hasCashout || (stop && !hasCashout) ? (
                <div className="cash-crash-modal">
                  {hasCashout ? (
                    <div className="cashout-container">
                      <h4>Cashed Out <span className="cashout-at"> {multiplierCrashValue.current}x</span></h4>
                    </div>
                  ) : (
                    ""
                  )}
                  {stop && !hasCashout ? (
                    <div className="crash-container">
                      <h4>Crashed</h4>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                ""
              )}
              
              </div>

              
            </div>
          </div>

          <div className="game-info">
            <div className={"balance-container"}>
              Amount:{balance}
              {/* {stop?"balance-container has-crashed":"balance-container"} */}
            </div>

            <Formik
              initialValues={{
                betAmount: "",
                cashoutAt: "",
              }}
              validationSchema={Yup.object({
                betAmount: Yup.number().required("Required"),
                cashoutAt: Yup.number().required("Required"),
              })}
              onSubmit={(values) => {
                if (!start) {
                  betSubmitted(values.betAmount);
                  console.log("bet submitted");
                } else if (start && !stop)
                  handleCashout(Number(values.betAmount));
              }}
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
                      console.log("e or - pressed");
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
                <button
                  type="submit"
                  className={
                    hasCashout
                      ? "submit-button disable-cashout"
                      : "submit-button"
                  }
                  disabled={hasCashout}
                >
                  {start && !stop ? "Cashout" : "Bet"}
                </button>
              </Form>
            </Formik>
            <br />

            <button onClick={handleClick}>Start</button>
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
