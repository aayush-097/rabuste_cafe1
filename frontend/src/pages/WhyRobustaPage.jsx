import { useState } from "react";
import WhyRobusta from "../sections/WhyRobusta";
import Footer from "../sections/Footer";
import StoryIntro from "../sections/StoryIntro";

const WhyRobustaPage = () => {
  const [mode, setMode] = useState(null); // null | deep | free

  return (
    <div className="page">
      {!mode && <StoryIntro onSelect={setMode} />}
      <WhyRobusta mode={mode} />
      <Footer />
    </div>
  );
};

export default WhyRobustaPage;

