
import * as React from "react";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import ErrorHandlerHash from "./components/ErrorHandlerHash";
import LoginPage from "./components/Login";
import MyDashboardPage from "./components/MyDashboard";

const Home = () => {
 // if (isLoading) return <PageLoading />;
const { selector } = useWalletSelector();

  return (
    <>
      <ErrorHandlerHash></ErrorHandlerHash>
      {
        selector?.isSignedIn() ? (      
          <MyDashboardPage />
        ) : (
          <LoginPage/>
        )
      }
    </>
  );
};

export default Home;
