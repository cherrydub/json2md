import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import PackageJsonReader from "./components/PackageJsonReader";

function App() {
  return (
    <>
      <PackageJsonReader />
    </>
  );
}

export default App;
