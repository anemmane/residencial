import React from "react";
import ResidentList from "../components/ResidentList";

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Panel Administrativo</h2>
      <ResidentList />
    </div>
  );
}
