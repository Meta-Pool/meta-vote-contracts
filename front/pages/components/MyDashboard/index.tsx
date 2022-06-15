import React from 'react';
import DashboardHeader from './DashHeader';

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
