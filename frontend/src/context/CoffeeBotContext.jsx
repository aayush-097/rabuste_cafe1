import { createContext, useContext, useState } from 'react';

const CoffeeBotContext = createContext();

export const CoffeeBotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openCoffeeBot = () => setIsOpen(true);
  const closeCoffeeBot = () => setIsOpen(false);
  const toggleCoffeeBot = () => setIsOpen(!isOpen);

  return (
    <CoffeeBotContext.Provider value={{ isOpen, openCoffeeBot, closeCoffeeBot, toggleCoffeeBot }}>
      {children}
    </CoffeeBotContext.Provider>
  );
};

export const useCoffeeBot = () => {
  const context = useContext(CoffeeBotContext);
  if (!context) {
    throw new Error('useCoffeeBot must be used within CoffeeBotProvider');
  }
  return context;
};
