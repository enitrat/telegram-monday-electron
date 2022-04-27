import Home from "./pages/Home";
import {
  HashRouter,
  Routes,
  Route, Outlet,
} from "react-router-dom";
import Config from "./pages/Config";
import Ready from "./pages/Ready";
import {MondayConfig} from "./components/MondayConfig/MondayConfig";
import KeyConfig from "./components/KeyConfig/KeyConfig";
import Navbar from "./components/Navbar";

export function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LayoutsWithNavbar/>}>
            <Route path="/" element={<Home/>}/>
            <Route path="/config" element={<Config/>}/>
            <Route path="/key-config" element={<KeyConfig/>}/>
            <Route path="/monday-config" element={<MondayConfig/>}/>
            <Route path="/ready" element={<Ready/>}/>
          </Route>
        </Routes>
      </HashRouter>
    </>
  )
}

function LayoutsWithNavbar() {
  return (
    <>
      {/* Your navbar component */}
      <Navbar/>

      {/* This Outlet is the place in which react-router will render your components that you need with the navbar */}
      <Outlet/>

      {/* You can add a footer to get fancy in here :) */}
    </>
  );
}