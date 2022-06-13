import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import {  Container} from '@chakra-ui/react';
import React from 'react';
import DashboardHeader from './header';

type Props = {
  shortVersion?: boolean
}

const MyDashboardPage = (props: Props) => {
  return (
      <section id="dashboard">
        <DashboardHeader></DashboardHeader>
      </section>

  );
};

export default MyDashboardPage;
