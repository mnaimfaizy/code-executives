import React from 'react';

const TestComponent: React.FC = () => {
  const code = `console.log('Hello World');`;

  return (
    <div>
      <pre>{code}</pre>
    </div>
  );
};

export default TestComponent;
