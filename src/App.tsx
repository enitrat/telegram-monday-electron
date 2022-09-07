import Home from "./pages/Home";
import {HashRouter, Outlet, Route, Routes,} from "react-router-dom";
import Config from "./pages/Config";
import FillBoard from "./pages/FillBoard";
import {MondayConfig} from "./components/MondayConfig/MondayConfig";
import KeyConfig from "./components/KeyConfig/KeyConfig";
import Navbar from "./components/Navbar";
import UpdateBoard from "./pages/UpdateBoard";
import {NotificationContainer} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Texting from "./pages/Texting";
import MainMenu from "./pages/MainMenu";
import ExportToCSV from "./pages/ExportToCSV";
import MassDM from "./pages/MassDM";


export function App() {
  return (
    <>
      <NotificationContainer/>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LayoutsWithNavbar/>}>
            <Route path="/" element={<Home/>}/>
            <Route path="/config" element={<Config/>}/>
            <Route path="/key-config" element={<KeyConfig/>}/>
            <Route path="/monday-config" element={<MondayConfig/>}/>
            <Route path="/fill-board" element={<FillBoard/>}/>
            <Route path="/update-board" element={<UpdateBoard/>}/>
            <Route path="/menu" element={<MainMenu/>}/>
            <Route path="/texting" element={<Texting/>}/>
            <Route path="/massDM" element={<MassDM/>}/>
            <Route path={"/export"} element={<ExportToCSV/>}/>

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