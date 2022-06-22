
import * as React from "react";
import ErrorHandlerHash from "./components/ErrorHandlerHash";
import MyDashboardPage from "./components/MyDashboard";

const Home = () => {
 // if (isLoading) return <PageLoading />;

  return (
    <>
      <ErrorHandlerHash></ErrorHandlerHash>
      <MyDashboardPage />
    </>
  );
};

export default Home;
