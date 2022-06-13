import {Container, Flex, Heading, Text} from '@chakra-ui/react';
import React from 'react';

type Props = {
  shortVersion?: boolean
}

const DashboardHeader = (props: Props) => {
  return (
    <section>
      <Container id="dashboard-header" backgroundColor={'red'}>
        <Flex justifyContent={{ base: 'center', md: 'center' }} flexDirection={{ base: 'column', md: 'column' }} >
          <Heading lineHeight={'133%'} textAlign={'center'} fontWeight={700} color="gray.900" fontSize={'3xl'}> Dashboard Header</Heading>
        </Flex>
      </Container>

    </section>
  );
};

export default DashboardHeader;
