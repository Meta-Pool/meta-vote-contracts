import React from 'react';
import DashboardHeader from './DashHeader';
import ProjectList from './ProjectList';

type Props = {
  shortVersion?: boolean
}

const MyDashboardPage = (props: Props) => {
  return (
      <section id="dashboard">
        <DashboardHeader></DashboardHeader>
        <ProjectList></ProjectList>
      </section>

  );
};

export default MyDashboardPage;
