import React from 'react';

const Content = ({ children }) => {
  return (
    <section className="bg-white py-6">
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  );
};

export default Content;