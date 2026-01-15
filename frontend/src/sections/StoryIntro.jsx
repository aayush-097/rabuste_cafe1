import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../styles/StoryIntro.css";

const StoryIntro = ({ onSelect }) => {
  const container = useRef(null);
  const leftBlock = useRef(null);
  const rightBlock = useRef(null);
  const question = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // RESET TRANSFORMS
    gsap.set([leftBlock.current, rightBlock.current], {
      x: 0,
      opacity: 1,
    });

    // MEASURE BLOCK WIDTHS
    const leftRect = leftBlock.current.getBoundingClientRect();
    const rightRect = rightBlock.current.getBoundingClientRect();
    const center = window.innerWidth / 2;

    // FINAL X TO MEET CENTER
    const leftStopX = center - leftRect.right; // left block stops so its right edge meets center
    const rightStopX = center - rightRect.left; // right block stops so its left edge meets center

    // START OFFSCREEN
    gsap.set(leftBlock.current, { x: -window.innerWidth, opacity: 0 });
    gsap.set(rightBlock.current, { x: window.innerWidth, opacity: 0 });
    gsap.set(question.current, { opacity: 0, pointerEvents: "none" });

    // CURTAIN OPEN ANIMATION
    const tl = gsap.timeline();
    tl.to(leftBlock.current, {
      x: leftStopX,
      opacity: 1,
      duration: 1.3,
      ease: "power4.out",
    }).to(
      rightBlock.current,
      {
        x: rightStopX,
        opacity: 1,
        duration: 1.3,
        ease: "power4.out",
      },
      "<"
    ).to(question.current, {
      opacity: 1,
      pointerEvents: "auto",
      duration: 0.6,
    });

    return () => (document.body.style.overflow = "");
  }, []);

  const handleAnswer = (type) => {
    const tl = gsap.timeline({
      onComplete: () => onSelect(type),
    });

    // CURTAIN CLOSE ANIMATION
    tl.to(question.current, { opacity: 0, duration: 0.3 })
      .to(leftBlock.current, {
        x: window.innerWidth, // left goes right offscreen
        opacity: 0,
        duration: 1.4,
        ease: "power4.inOut",
      })
      .to(
        rightBlock.current,
        {
          x: -window.innerWidth, // right goes left offscreen
          opacity: 0,
          duration: 1.4,
          ease: "power4.inOut",
        },
        "<"
      )
      .to(container.current, { opacity: 0, duration: 0.2 });
  };

  return (
    <div className="story" ref={container}>
      <div className="block left" ref={leftBlock} />
      <div className="block right" ref={rightBlock} />

      <div className="question" ref={question}>
        <h2>Do you want to deep dive into the Robusta story?</h2>
        <div className="actions">
          <button onClick={() => handleAnswer("deep")}>Deep Dive</button>
          <button onClick={() => handleAnswer("free")}>Explore Myself</button>
        </div>
      </div>
    </div>
  );
};

export default StoryIntro;
