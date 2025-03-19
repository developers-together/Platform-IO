import React, { useState, useEffect } from "react";
import ShinyText from "./ShinyText";
import SplitText from "./SplitText";
import Magnet from "./Magnet";
import "./landing.css";

export default function Landing({ setCurrentPage }) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [fadingOut, setFadingOut] = useState(false); // New state for transition

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true); // Start fade-out animation
      setTimeout(() => {
        setShowOverlay(false); // Fully hide after animation completes
      }, 1000); // Match this duration with CSS animation time
    }, 6000);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setFadingOut(true);
        setTimeout(() => {
          setShowOverlay(false);
        }, 1000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="start5">
      {showOverlay && (
        <div className={`overlay ${fadingOut ? "fade-out" : ""}`}>
          <div className="overlay-content">
            <SplitText
              text="Hello, and Welcome to Platform-IO"
              className="overlay-split-text"
              delay={150}
              animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
              animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
              easing="easeOutCubic"
              threshold={0.2}
              rootMargin="-50px"
            />
          </div>
        </div>
      )}
      <div className="starter-page5">
        <div className="starter-content5">
          <h1>Platform-IO</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sed
            dapibus leo nec ornare diam sed commodo nibh ante facilisis
            bibendum.
          </p>
          <Magnet
            padding={10000}
            disabled={false}
            magnetStrength={20}
            activeTransition="transform 0.2s ease-out"
            inactiveTransition="transform 0.4s ease-in-out"
          >
            <button
              className="btn-custom5"
              onClick={() => setCurrentPage("login")}
            >
              <ShinyText text="Use the Platform" speed={3} />
            </button>
          </Magnet>
        </div>
      </div>
    </div>
  );
}
