import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";

const LandlordLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content-wrapper">
        <div className="dashboard-content-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LandlordLayout;
