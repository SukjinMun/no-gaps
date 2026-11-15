import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import BaseTemplate from "./pages/BaseTemplate.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AddressesPage from "./pages/AddressesPage.jsx";
import AddressFormPage from "./pages/AddressFormPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <BaseTemplate>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/addresses/new" element={<AddressFormPage />} />
          <Route path="/addresses/:id/edit" element={<AddressFormPage />} />
        </Routes>
      </BaseTemplate>
    </BrowserRouter>
  </StrictMode>,
);
