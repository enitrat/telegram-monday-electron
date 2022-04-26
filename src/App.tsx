
import {useEffect} from "react";
import Home from "./pages/Home";
import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";
import Config from "./pages/Config";
import Ready from "./pages/Ready";

export function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/config" element={<Config/>}/>
          <Route path="/ready" element={<Ready/>}/>
        </Routes>
      </HashRouter>
    </>
  )
}