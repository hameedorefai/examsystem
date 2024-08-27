import React from 'react';
import { useMyContext } from '../context/MyContext';

const MyComponent = () => {
  const contextValue = useMyContext();
  return <div>{contextValue}</div>;
};

export default MyComponent;
