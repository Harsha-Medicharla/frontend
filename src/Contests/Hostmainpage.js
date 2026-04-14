// App.js
import React from 'react';
import HostContestForm from './hostcontestform';

const Hostmain = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Create Contest</h1>
      <HostContestForm />
    </div>
  );
};

export default Hostmain;
