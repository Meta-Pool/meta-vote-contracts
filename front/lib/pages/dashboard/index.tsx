import React from "react";
import ErrorHandlerHash from "../components/ErrorHandlerHash";
import MyDashboardPage from "../components/MyDashboard";
export default function DashboardContainer() {

  return (
    <>
      <ErrorHandlerHash></ErrorHandlerHash>
      <MyDashboardPage />
    </>
  );
}
