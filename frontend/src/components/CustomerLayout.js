import React from 'react';
import AppLayout from './AppLayout';

const links = [
  { to: '/dashcust', label: 'Dashboard' },
  { to: '/releasescust', label: 'Releases' },
  { to: '/pullscust', label: 'Pull List' },
  { to: '/recommendation', label: 'Recommendations' },
];

function CustomerLayout({ children, title }) {
  return <AppLayout title={title} links={links}>{children}</AppLayout>;
}

export default CustomerLayout;
