import coffeeMenu from './coffeeMenu';

export const explainableCoffee = ({ mood, timeOfDay, prefersMilk }) => {
  const temperature =
    timeOfDay === 'morning' || timeOfDay === 'night' ? 'hot' : 'cold';

  const matches = coffeeMenu.filter((coffee) => {
    return (
      coffee.temperature === temperature &&
      coffee.milk === prefersMilk &&
      coffee.moods.includes(mood)
    );
  });

  const fallback = coffeeMenu.filter(
    (coffee) => coffee.milk === prefersMilk
  );

  const finalMatches = matches.length > 0 ? matches : fallback;

  return {
    title: `Perfect picks for a ${mood} ${timeOfDay}`,
    reasoning: `We matched your mood, preferred time, and ${
      prefersMilk ? 'milk-based' : 'non-milk'
    } choice with our Robusta menu.`,
    matches: finalMatches.slice(0, 5),
  };
};


export const explainableArt = ({ mood }) => ({
  title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Reverie`,
  reasoning: `This palette reflects the emotional tone of a ${mood} state.`,
});

export const explainableWorkshop = ({ mood, timeOfDay }) => ({
  title:
    mood === 'focused'
      ? 'Precision Brew Lab'
      : timeOfDay === 'evening'
      ? 'Coffee Tasting Stories'
      : 'Latte Art Experience',
  reasoning: `Best suited for a ${mood} mindset during the ${timeOfDay}.`,
});



