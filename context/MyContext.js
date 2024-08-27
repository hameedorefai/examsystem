import React, { createContext, useContext } from 'react';

// إنشاء السياق
const MyContext = createContext();

// مكون موفر السياق
export const MyProvider = ({ children }) => {
  const value = "Hello from Context!";
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

// دالة للوصول إلى السياق
export const useMyContext = () => {
  return useContext(MyContext);
};
