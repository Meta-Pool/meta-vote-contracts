
import {  Container } from "@chakra-ui/react";
import * as React from "react";
import ErrorHandlerHash from "./components/ErrorHandlerHash";
import PageLoading from "./components/PageLoading";

const Home = () => {
 // if (isLoading) return <PageLoading />;

  return (
    <>
      <ErrorHandlerHash></ErrorHandlerHash>
      <Container maxW="container.xl">
        Home page
      </Container>
    </>
  );
};

export default Home;
