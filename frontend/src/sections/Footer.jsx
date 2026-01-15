import { useEffect, useRef } from "react";
import gsap from "gsap";
import "../styles/Footer.css";


const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-col", {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h3>Rabuste Coffee</h3>
          <p className="muted">
            Coffee × Art × Technology.  
            Bold robusta with human-centered design.
          </p>
        </div>

        <div className="footer-col">
          <h4>Connect with us</h4>
          <ul>
            <li>
              Instagram: <a href="https://www.instagram.com/rabuste.coffee/">@rabuste.coffee</a>
            </li>
            <li>
              Twitter/X: <a href="#">@rabuste</a>
            </li>
            <li>
              Email: <a href="#">hello@rabuste.coffee</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li>📞 +91 98765 43210</li>
            <li>🕘 Mon–Sat, 9:30am–11pm</li>
            <li>
  📍{" "}
  <a
    href="https://google.com/maps/place/rabuste/data=!4m2!3m1!1s0x3be04d00111b19b5:0xba45eb84da00c79f?sa=X&ved=1t:242&ictx=111"
    target="_blank"
    rel="noopener noreferrer"
  >
    Rabuste Cafe, India
  </a>
</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Rabuste Coffee. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;





