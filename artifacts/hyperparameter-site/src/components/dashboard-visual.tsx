import { useEffect, useRef, useState } from 'react';

import dashboardMockup from '@assets/Hyperparameter_AI_Training_Dashboard_1792681183465.png';

export function DashboardVisual() {
  const visualRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const element = visualRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpened(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px 0px', threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={visualRef}
      className={`workspace${opened ? ' workspace--opened' : ''}`}
      data-testid="visual-workspace"
    >
      <div className="workspace-glow" aria-hidden="true" />
      <div className="workspace-visual">
        <img
          className="workspace-mockup"
          src={dashboardMockup}
          alt="Hyperparameter's AI training dashboard shown on a MacBook Pro"
          data-testid="img-dashboard-product"
        />
      </div>
      <div className="callout c1">
        <b>01 Pipeline state</b>
        Idea → Data → Model → Train → Evaluate → Deploy, tracked per project
      </div>
      <div className="callout c2">
        <b>02 Run context</b>
        Steps, GPU utilisation and loss stay attached to the run
      </div>
      <div className="callout c3">
        <b>03 Evaluation</b>
        Latest eval sits next to the run that produced it
      </div>
    </div>
  );
}
