import React from 'react';
import AppLayout from './AppLayout';

const links = [
  { to: '/dashempl', label: 'Dashboard' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/pullsempl', label: 'Pull List' },
  { to: '/cust', label: 'Customers' },
  { to: '/empl', label: 'Employees' },
];

function EmployeeLayout({ children, title }) {
  return <AppLayout title={title} links={links}>{children}</AppLayout>;
}

export default EmployeeLayout;
