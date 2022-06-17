import React from 'react';
import DashboardHeader from './DashHeader';
import ProjectList from './ProjectList';
import LockingPosition from './LockingPositions';

type Props = {
  shortVersion?: boolean
}

const MyDashboardPage = (props: Props) => {
  return (
      <section id="dashboard">
        <DashboardHeader></DashboardHeader>
        <LockingPosition></LockingPosition>
        <ProjectList></ProjectList>
      </section>

  );
};

export default MyDashboardPage;
