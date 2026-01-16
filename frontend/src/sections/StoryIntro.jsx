import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../styles/StoryIntro.css";

const StoryIntro = ({ onSelect }) => {
  const container = useRef(null);
  const question = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Initial state
    gsap.set(question.current, {
      opacity: 0,
      y: 40,
    });

    // Simple text fade + slide
    gsap.to(question.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    });

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleAnswer = (type) => {
    gsap.to(question.current, {
      opacity: 0,
      y: -30,
      duration: 0.6,
      ease: "power3.in",
      onComplete: () => onSelect(type),
    });
  };

  return (
    <div className="story" ref={container}>
      <div className="question" ref={question}>
        <h2>Do you want to deep dive into the Robusta story?</h2>

        <div className="actions">
          <button onClick={() => handleAnswer("deep")}>
            Deep Dive
          </button>
          <button onClick={() => handleAnswer("free")}>
            Explore Myself
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryIntro;