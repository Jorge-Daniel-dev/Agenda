import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Forms from "./components/Forms";
import { Link } from "react-router-dom";
import WorkAgenda from "./components/WorkAgenda";
import './App.css'
function App() {

  return (
    <>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/Forms" element={<Forms/>}/>
          <Route path="/Agenda" element={<WorkAgenda/>}/>
        </Routes>
    </>
  )
}

export default App
