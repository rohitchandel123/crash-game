import CrashGame from "./component/CrashGame";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <CrashGame />
    </>
  );
}

export default App;
