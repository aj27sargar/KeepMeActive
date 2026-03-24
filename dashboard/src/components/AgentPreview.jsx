import React, { useEffect, useRef } from "react";

export default function AgentPreview() {
  const dotRef = useRef(null);
  const frameRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      angleRef.current += 0.012;
      const cx = 200, cy = 125, rx = 130, ry = 70;
      const x = cx + rx * Math.cos(angleRef.current);
      const y = cy + ry * Math.sin(angleRef.current);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="agent-preview-card card">
      <div className="card-header">
        <h2 className="card-title">Agent Activity Preview</h2>
        <p className="card-subtitle">Real-time automation visualization</p>
      </div>
      <div className="preview-box">
        <div className="preview-hint">
          Place your cursor inside this box to preview automation movement
        </div>
        <div className="cursor-dot" ref={dotRef}>
          <div className="cursor-ring" />
          <div className="cursor-core" />
        </div>
        <div className="preview-grid" />
      </div>
    </div>
  );
}