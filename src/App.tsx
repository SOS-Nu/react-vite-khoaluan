// App.tsx (ĐÃ XÓA useEffect)

import { RouterProvider } from "react-router-dom";
import { router } from "./router";

// Import CSS chính
import "react-toastify/dist/ReactToastify.css";
import "./styles/app.module.scss";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
