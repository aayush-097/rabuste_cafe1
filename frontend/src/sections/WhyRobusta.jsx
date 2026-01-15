import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "../styles/WhyRobusta.css";

gsap.registerPlugin(ScrollTrigger);

const levels = [
  { title: "Harvesting", body: "Beans collected", video: "/videos/harvest.mp4" },
  { title: "Drying", body: "Sun dried", video: "/videos/drying.mp4" },
  { title: "Grinding", body: "Precision grind", video: "/videos/grinding.mp4" },
  { title: "Brewing", body: "Final cup", video: "/videos/brewing.mp4" },
];

export default function WhyRobusta({ mode }) {
  const movingTrack = useRef(null);
  const containerRef = useRef(null);
  const played = useRef(false);
  const [isIntroActive, setIsIntroActive] = useState(true);

  useEffect(() => {
    // 1. FREE MODE CLEANUP
    if (mode === "free") {
      setIsIntroActive(false);
      document.body.style.overflow = "auto";
      return;
    }

    // 2. DEEP DIVE SEQUENCE
    if (mode === "deep" && !played.current) {
      played.current = true;
      const cards = gsap.utils.toArray(".level");
      const dotGroups = gsap.utils.toArray(".path-dots");
      const tl = gsap.timeline();
      
      document.body.style.overflow = "hidden";

      cards.forEach((card, index) => {
        const box = card.querySelector(".level-video");
        const video = box.querySelector("video");
        
        // Move Camera
        tl.to(movingTrack.current, {
          y: () => -(card.offsetTop - (window.innerHeight / 2) + 110),
          duration: 1.2,
          ease: "expo.inOut"
        })
        // Zoom and Play
        .to(box, {
          zIndex: 999,
          x: () => (window.innerWidth / 2) - (box.getBoundingClientRect().left + box.offsetWidth / 2),
          y: () => (window.innerHeight / 2) - (box.getBoundingClientRect().top + box.offsetHeight / 2),
          scale: 2,
          duration: 1,
          ease: "power3.inOut",
          onStart: () => video.play()
        })
        .to({}, { duration: 3 })
        // Back to Grid
        .to(box, {
          x: 0, y: 0, scale: 1,
          duration: 0.7,
          ease: "power3.in",
          onComplete: () => {
            video.play(); // Keep looping in grid
            gsap.set(box, { zIndex: 1 });
          }
        });

        // Glow Dots
        if (dotGroups[index]) {
          tl.to(dotGroups[index].querySelectorAll(".dot"), {
            backgroundColor: "#c6a16e",
            boxShadow: "0 0 20px #c6a16e",
            stagger: 0.1,
            duration: 0.3
          }, "-=0.5"); // Start slightly early
        }
      });

      // FINISH: Reset track and allow scrolling
      tl.to(movingTrack.current, {
        y: 0,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          setIsIntroActive(false);
          document.body.style.overflow = "auto";
          // Important: Let GSAP recalculate everything for ScrollTrigger
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);
        }
      });
    }
  }, [mode]);

  // 3. AUTO-PLAY SCROLL TRIGGER (Only when intro is done)
  useEffect(() => {
    if (!isIntroActive) {
      const videoElements = gsap.utils.toArray(".level-video video");
      
      const triggers = videoElements.map((video) => {
        return ScrollTrigger.create({
          trigger: video,
          start: "top 80%",
          end: "bottom 20%",
          onEnter: () => video.play(),
          onEnterBack: () => video.play(),
          onLeave: () => video.pause(),
          onLeaveBack: () => video.pause(),
        });
      });

      return () => {
        triggers.forEach(t => t.kill());
      };
    }
  }, [isIntroActive]);

  return (
    <div ref={containerRef} className={`game-intro-viewport ${!isIntroActive ? "intro-complete" : ""}`}>
      
      <div className="video-bg-container">
        <video 
          src="/videos/bg-atmosphere.mp4" 
          autoPlay muted loop playsInline 
          className="main-bg-video"
        />
        <div className="bg-overlay"></div>
      </div>

      <div className="moving-track" ref={movingTrack}>
        <section id="why">
          <p className="section-kicker">Why Robusta</p>
          <h2 className="section-title">The journey of a bold bean</h2>

          <div className="levels">
            {levels.map((lvl, i) => (
              <div key={i} className="level-group">
                <div className={`level ${i % 2 ? "right" : ""}`}>
                  <div className="level-video">
                    <video src={lvl.video} muted playsInline preload="auto" loop />
                  </div>
                  <div className="level-text">
                    <h3>{lvl.title}</h3>
                    <p className="muted">{lvl.body}</p>
                  </div>
                </div>
                
                {i < levels.length - 1 && (
                  <div className={`path-dots ${i % 2 ? "curve-left" : "curve-right"}`}>
                    {[...Array(5)].map((_, j) => (
                      <div 
                        key={j} 
                        className="dot" 
                        style={{ backgroundColor: (!isIntroActive || mode === "free") ? "#c6a16e" : "" }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div id="final-section" className="gift-card">
            <div className="coffee-cup">☕</div>
            <p>Journey Complete.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

