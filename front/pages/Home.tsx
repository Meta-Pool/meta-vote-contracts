
import {  Container } from "@chakra-ui/react";
import * as React from "react";
import { useExample } from "./../hooks/example";
import ErrorHandlerHash from "./components/ErrorHandlerHash";
import PageLoading from "./components/PageLoading";

const Home = () => {
  const { data, isLoading } = useExample();
 // if (isLoading) return <PageLoading />;

  return (
    <>
      <ErrorHandlerHash></ErrorHandlerHash>
      <Container maxW="container.xl">
        hola mundo
      </Container>
    </>
  );
};

export default Home;
