import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import HandwrittenText from "../components/HandwrittenText";
import { fetchMenuImages } from "../services/api";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import "../styles/navbar.css";

const Navbar = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // ✅ MOBILE STATE
  const profileRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navRootRef = useRef(null);

  /* ================= LOGO FETCH ================= */
  useEffect(() => {
    let mounted = true;
    fetchMenuImages()
      .then((res) => {
        const images = Array.isArray(res.data) ? res.data : [];
        const logos = images.filter(
          (img) =>
            img.category === "logo" ||
            (img.public_id && img.public_id.includes("logo"))
        );
        const primary =
          logos.find((l) => l.public_id && l.public_id.includes("primary")) ||
          logos[0];
        if (mounted && primary) {
          setLogoUrl(primary.url || primary.secure_url || null);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  /* ================= GSAP ORB EFFECT ================= */
  useEffect(() => {
    const root = navRootRef.current;
    if (!root) return;

    const buttons = root.querySelectorAll(".nav-button");

    buttons.forEach((btn) => {
      const orb = btn.querySelector(".hover-orb");
      const text = btn.querySelector(".nav-text");
      if (!orb) return;

      const xTo = gsap.quickTo(orb, "x", { duration: 0.25, ease: "power3.out" });
      const yTo = gsap.quickTo(orb, "y", { duration: 0.25, ease: "power3.out" });

      const move = (e) => {
        const rect = btn.getBoundingClientRect();
        xTo(e.clientX - rect.left);
        yTo(e.clientY - rect.top);

        gsap.to(orb, { scale: 2.2, opacity: 1, duration: 0.2 });
        gsap.to(btn, {
          scale: 1.08,
          boxShadow: "0 0 35px rgba(216,107,50,0.6)",
          duration: 0.2,
        });
      };

      const leave = () => {
        gsap.to(orb, { scale: 0, opacity: 0, duration: 0.3 });
        gsap.to(btn, {
          scale: 1,
          boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
        });
        if (text) gsap.to(text, { color: "#f5efe8", duration: 0.2 });
      };

      btn.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", leave);

      btn._cleanup = () => {
        btn.removeEventListener("mousemove", move);
        btn.removeEventListener("mouseleave", leave);
      };
    });

    return () => {
      buttons.forEach((btn) => btn._cleanup?.());
    };
  }, [user]);

  /* ================= TEXT SPLIT EFFECT ================= */
  useEffect(() => {
    const buttons = document.querySelectorAll(".nav-button");

    buttons.forEach((btn) => {
      const text = btn.querySelector(".nav-text");
      if (!text || text.dataset.split) return;

      text.dataset.split = "true";

      const letters = text.textContent.split("");
      text.innerHTML = letters
        .map(
          (l) =>
            `<span class="nav-letter">${l === " " ? "&nbsp;" : l}</span>`
        )
        .join("");

      const lettersEls = text.querySelectorAll(".nav-letter");

      btn.addEventListener("mouseenter", () => {
        gsap.fromTo(
          lettersEls,
          {
            filter: "blur(2px)",
            opacity: 0.6,
            textShadow: "0 0 0 rgba(216,107,50,0)",
          },
          {
            filter: "blur(0px)",
            opacity: 1,
            textShadow: "0 0 12px rgba(216,107,50,0.6)",
            duration: 0.45,
            ease: "power2.out",
            stagger: 0,
          }
        );
      });
    });
  }, []);

  return (
    <header className="top-bar">
      {/* LOGO */}
      <NavLink to="/" className="logo handwritten-logo">
        {logoUrl && (
          <img src={logoUrl} alt="Rabuste logo" className="nav-logo" />
        )}
        {/* <HandwrittenText text=" Rabuste " /> */}
      </NavLink>

      {/* MOBILE HAMBURGER */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
      >
        ☰
      </button>

      {/* NAV */}
      <nav
        className={`chip-nav ${mobileOpen ? "open" : ""}`}
        ref={navRootRef}
      >
        {/* MOBILE CLOSE */}
        <button
          className="mobile-close-btn"
          onClick={() => setMobileOpen(false)}
        >
          ✕
        </button>

        <NavLink to="/" end className="nav-button" onClick={() => setMobileOpen(false)}>
          <span className="nav-text">Home</span>
          <span className="hover-orb" />
        </NavLink>

        <NavLink to="/why-robusta" className="nav-button" onClick={() => setMobileOpen(false)}>
          <span className="nav-text">Why Robusta</span>
          <span className="hover-orb" />
        </NavLink>

        <NavLink to="/menu" className="nav-button" onClick={() => setMobileOpen(false)}>
          <span className="nav-text">Menu</span>
          <span className="hover-orb" />
        </NavLink>

        <NavLink to="/order" className="nav-button" onClick={() => setMobileOpen(false)}>
          <span className="nav-text">Order</span>
          <span className="hover-orb" />
        </NavLink>

        <NavLink to="/art" className="nav-button" onClick={() => setMobileOpen(false)}>
          <span className="nav-text">Art</span>
          <span className="hover-orb" />
        </NavLink>

        <NavLink to="/workshops" className="nav-button" onClick={() => setMobileOpen(false)}>
          <span className="nav-text">Workshops</span>
          <span className="hover-orb" />
        </NavLink>

        <NavLink to="/franchise" className="nav-button" onClick={() => setMobileOpen(false)}>
          <span className="nav-text">Franchise</span>
          <span className="hover-orb" />
        </NavLink>

        <NavLink to="/ai-experience" className="nav-button" onClick={() => setMobileOpen(false)}>
          <span className="nav-text">brew.ai</span>
          <span className="hover-orb" />
        </NavLink>

        {!user && (
          <>
            <NavLink to="/login" className="nav-button" onClick={() => setMobileOpen(false)}>
              <span className="nav-text">Login</span>
              <span className="hover-orb" />
            </NavLink>

            <NavLink to="/signup" className="nav-button" onClick={() => setMobileOpen(false)}>
              <span className="nav-text">Signup</span>
              <span className="hover-orb" />
            </NavLink>
          </>
        )}

        {user?.role === "admin" && (
          <NavLink to="/admin" className="nav-button" onClick={() => setMobileOpen(false)}>
            <span className="nav-text">Admin</span>
            <span className="hover-orb" />
          </NavLink>
        )}

        {user && (
          <div className="profile-wrapper" ref={profileRef}>
            <button
              className="nav-button profile-btn"
              onClick={() => setOpenProfile((p) => !p)}
            >
              <span className="profile-icon">👤</span>
              <span className="hover-orb" />
            </button>

            {openProfile && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;