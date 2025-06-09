import "./CrashGame.css";
import { ProjectImages } from "../assets/Constants";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import GameChart from "./GameChart";

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
  // const [hasCrashed, setHasCrashed] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const autoCashoutRef = useRef<number | null>(null);
  const multiplierCrashValue = useRef(0);

  useEffect(() => {
    tl.current = gsap.timeline({ paused: true });
    tl.current.to(".plane", { x: 780, y: -400, duration: 9, rotation: -15 });
    // tl.current.to(".plane", { x: 550, y: -250, duration: 4, rotation: -15 }, "4");

    return () => {
      if (tl.current) tl.current.kill();
      if (bgTween.current) bgTween.current.kill();
    };
  }, []);

  //useEffect showMultiplier
  useEffect(() => {
    if (
      autoCashoutRef.current &&
      Number(showMultiplier.toFixed(2)) >=
        Number(autoCashoutRef.current.toFixed(2)) &&
      !hasCashout
    ) {
      // console.log("auto cashback at", autoCashoutRef.current);
      // console.log(showMultiplier.toFixed(2), ">=");
      // console.log(autoCashoutRef.current.toFixed(2));
      handleCashout(betAmount);
    }
  }, [showMultiplier]);

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
          tl.current.kill();
        }
        if (bgTween.current) {
          bgTween.current.kill();
        }
      }
    },
    { dependencies: [start, stop], scope: container }
  );

  function handleCrash() {
    setStop(true);
    setStart(false);
  }

  function generateCrashValue() {
    let temp = Math.random();
    let profit = false;
    let crashValue;

    if (temp > 0.1) 
      profit = true;

    if (profit) {
      crashValue = (temp - 0) * 10;
    } else crashValue = 1;
    return crashValue;
  }

  function displayMultiplier(crashAt: number) {
    let val = 1;
    setShowMultiplier(1);
    const intervalID = setInterval(() => {
      if (crashAt == 1 || crashAt.toFixed(2) <= val.toFixed(2) ) {
        console.log("val is", val)
        console.log("crash at", crashAt)
        clearInterval(intervalID);
        handleCrash();  
      }
      else if(crashAt != 1 ){
      val = val + 0.01;
      setShowMultiplier(val);
    }
    }, 10);
  }

  function betSubmitted(betAmount: string) {
    setStart(true);
    setStop(false);
    setBalance(balance - Number(betAmount));
  }

  function handleCashout(betAmount: number) {
    multiplierCrashValue.current = Number(showMultiplier.toFixed(2));
    setHasCashout(true);
    let winningAmount = betAmount * showMultiplier;

    let newBalance: number = Number(balance) + Number(winningAmount.toFixed(2));
    setBalance(newBalance);
  }

  return (
    <>
      <div className="game-wrapper">
        <div className="game-container">
          <div ref={container} className="game-display-container">
            <div className="background-image" />

            <div className="game-display">
              <img src={ProjectImages.PLANE} className="plane" />

              <GameChart />

              <div className="bet-multiplier">
                <h2 className={stop ? "has-crashed" : ""}>
                  {start || stop ? `${showMultiplier.toFixed(2)}x` : ""}
                </h2>

                {hasCashout || (stop && !hasCashout) ? (
                  <div className="cash-crash-modal">
                    {hasCashout ? (
                      <div className="cashout-container">
                        <h4>
                          Cashed Out{" "}
                          <span className="cashout-at">
                            {" "}
                            {multiplierCrashValue.current}x
                          </span>
                        </h4>
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
            <div className={"balance-container"}>Balance: {balance}</div>

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
                  if (balance - Number(values.betAmount) >= 0) {
                    setBetAmount(Number(values.betAmount));
                    // console.log("cashout value entered", values.cashoutAt);
                    autoCashoutRef.current = Number(values.cashoutAt);
                    // console.log("selected cashout at", autoCashoutRef.current);
                    betSubmitted(values.betAmount);
                  } else toast.error("Insufficient Funds");
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
                  min={1.01}  
                  step="0.01"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (
                      e.key === "-" ||
                      e.key === "e" ||
                      e.key === "E" ||
                      (e.key === "." && e.currentTarget.value.includes("."))
                    ) {
                      e.preventDefault();
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
                    hasCashout && !stop
                      ? "submit-button disable-cashout"
                      : "submit-button"
                  }
                  disabled={hasCashout && !stop}
                >
                  {start && !stop ? "Cashout" : "Bet"}
                </button>
              </Form>
            </Formik>
            <br />
          </div>
        </div>
      </div>
    </>
  );
}
export default CrashGame;

// improve ui
// chart values sync
// slow animation
// crash animation