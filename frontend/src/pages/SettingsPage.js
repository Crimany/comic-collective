import React from 'react';
import CustomerLayout from '../components/CustomerLayout';
import EmployeeLayout from '../components/EmployeeLayout';

function SettingsPage() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const pageContent = (
    <div>
      <p>This page intentionally left blank.</p>
    </div>
  );

  if (userInfo?.role === 'employee') {
    return <EmployeeLayout title="Settings">{pageContent}</EmployeeLayout>;
  }

  return <CustomerLayout title="Settings">{pageContent}</CustomerLayout>;
}
 
export default SettingsPage;
