import React, { useState, useEffect } from "react";
import ShinyText from "./ShinyText";
import SplitText from "./SplitText";
import Magnet from "./Magnet";
import "./landing.css";

export default function Landing({ setCurrentPage }) {
  const [showOverlay, setShowOverlay] = useState(true);

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  // Auto-dismiss the overlay after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="start5">
      {showOverlay && (
        <div className="overlay">
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
              onLetterAnimationComplete={handleAnimationComplete}
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
          {/* Wrap the button with Magnet */}
          <Magnet
            padding={500}
            disabled={false}
            magnetStrength={30}
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
