import React from "react";
import ReactDOM from "react-dom/client";
import { App as AntdApp } from "antd";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <AntdApp>
        <App />
      </AntdApp>
    </Provider>
  </React.StrictMode>
);
