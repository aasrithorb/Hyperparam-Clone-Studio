import { useEffect, useState } from 'react';

const agentStatuses = [
  ['planner-agent', 'scoping the outcome'],
  ['research-agent', 'waiting on your approval'],
];

export function HeroAgentStatus() {
  const [activeStatus, setActiveStatus] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      setActiveStatus((current) => (current + 1) % agentStatuses.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const [agent, status] = agentStatuses[activeStatus];

  return (
    <div
      className="agent-chip agent-chip--rotating"
      data-testid="hero-agent-status"
      aria-label={`${agent}: ${status}`}
    >
      <i aria-hidden="true" />
      <span className="agent-chip__window">
        <span className="agent-chip__line" key={activeStatus}>
          <span>{agent}</span>
          <span className="agent-chip__separator" aria-hidden="true">
            ›
          </span>
          <strong>{status}</strong>
        </span>
      </span>
    </div>
  );
}
