import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Menu, ShieldCheck, KeyRound, RotateCw } from 'lucide-react';
import { DashboardVisual } from './components/dashboard-visual';
import { HeroAgentStatus } from './components/hero-agent-status';
import './hero-motion.css';

const formUrl = 'https://form.typeform.com/to/blVyabUs';
const navItems = [['Problem', '#problem'], ['Workflow', '#workflow'], ['Approach', '#approach'], ['Infrastructure', '#infrastructure'], ['FAQ', '#faq']];
const artifacts = [
  ['explore_v4.ipynb', 'Problem definition · Notebook'], ['s3://raw-xrays/2025/', 'Data · Object storage'],
  ['clean_labels_FINAL.py', 'Data preparation · Local script'], ['model_shortlist.md', 'Approach selection · Docs'],
  ['sweep_lora.yaml', 'Experimentation · Config repo'], ['gpu-console › node-07', 'Training & compute · Cloud console'],
  ['eval_regression_v3.py', 'Evaluation · Separate repo'], ['serve.Dockerfile', 'Deployment · Deploy pipeline'],
];
const stages = [
  ['1', 'Objective', 'Describe the outcome and the constraints that matter. Requirements are clarified and gaps flagged before any tool is chosen.'],
  ['2', 'Plan', 'Break the objective into ordered, inspectable engineering work with dependencies and approval gates.'],
  ['3', 'Data', 'Prepare and validate the data needed to evaluate the objective against real-world examples.'],
  ['4', 'Approach', 'Compare candidate approaches against quality, latency, cost, privacy and operational constraints.'],
  ['5', 'Train', 'Run reproducible experiments with compute, configuration and checkpoints attached to each run.'],
  ['6', 'Evaluate', 'Measure candidates against the requirement. Results stay visible before anything advances.'],
  ['7', 'Deploy', 'Package an approved model into a usable service with scoped access and a controlled rollout.'],
  ['8', 'Improve', 'Monitor outcomes and feed new evidence back into the next iteration.'],
];
type WorkflowPanelContent = {
  projectPath: string;
  title: string;
  prompt: string;
  constraints: string[];
  details: Array<[string, string]>;
  questions: string[];
};
const workflowPanels: WorkflowPanelContent[] = [
  {
    projectPath: 'objective',
    title: 'Objective',
    prompt: 'Flag likely lung abnormalities in chest X-rays so radiologists can prioritise their review queue.',
    constraints: ['Runs inside hospital VPC', 'p50 latency under 500 ms', 'Assistive only, never auto-diagnoses'],
    details: [['Task', 'Multi-label image classification'], ['Output', 'Findings + confidence, routed to review'], ['Metric that matters', 'Sensitivity on held-out hospital data']],
    questions: ['How many hospital images carry radiologist-confirmed labels?', 'Are all findings in scope, or a priority subset?'],
  },
  {
    projectPath: 'plan',
    title: 'Plan',
    prompt: 'Turn the objective into ordered work, with dependencies and approval gates visible before execution starts.',
    constraints: ['Data before training', 'Evaluation before deployment', 'Human approval at each gate'],
    details: [['Sequence', 'Data → approach → train → evaluate → deploy'], ['Dependency', 'Training waits for a validated dataset'], ['Approval gate', 'A person signs off before deployment']],
    questions: ['Who approves access to production?', 'What should happen if a quality gate is missed?'],
  },
  {
    projectPath: 'data/chest-xray-v1',
    title: 'Data',
    prompt: 'Prepare the ChestX-ray dataset with label, provenance and split checks attached to the project.',
    constraints: ['12,400 images', 'Labels reviewed', 'Hospital-held-out validation'],
    details: [['Source', 'ChestX-ray v1'], ['Preparation', 'Deduplicate and validate labels'], ['Split strategy', 'Hold out hospital sites for evaluation']],
    questions: ['Are labels confirmed by a radiologist?', 'Which patient identifiers must be removed?'],
  },
  {
    projectPath: 'approach/shortlist',
    title: 'Approach',
    prompt: 'Compare candidate approaches against sensitivity, latency, privacy and operating cost.',
    constraints: ['Compare more than one path', 'Measure on held-out data', 'Keep the decision traceable'],
    details: [['Candidates', 'Existing vision model · PEFT / LoRA'], ['Quality target', 'Sensitivity on held-out hospital data'], ['Operational target', 'p50 latency under 500 ms']],
    questions: ['Does an existing vision model meet the sensitivity target?', 'Is fine-tuning allowed inside the hospital VPC?'],
  },
  {
    projectPath: 'train/run-3',
    title: 'Train',
    prompt: 'Run reproducible experiments with configuration, compute, loss and checkpoints attached.',
    constraints: ['Run 2 / 5', '78% GPU utilisation', '18,400 / 50,000 steps'],
    details: [['Elapsed time', '48 min'], ['Training loss', '0.213 · decreasing'], ['Checkpoint', 'ckpt-18400 saved']],
    questions: ['Does this run improve sensitivity?', 'Is the remaining compute within the project budget?'],
  },
  {
    projectPath: 'evaluation/held-out-site',
    title: 'Evaluate',
    prompt: 'Compare the candidate with the objective on held-out hospital data before anything advances.',
    constraints: ['92.6% accuracy', 'Sensitivity gate required', 'Results tied to run-3'],
    details: [['Latest result', 'Evaluation completed'], ['Latency', '410 ms p50'], ['Decision', 'Awaiting human review']],
    questions: ['Did the candidate meet the required sensitivity?', 'Are there failure cases that need review?'],
  },
  {
    projectPath: 'deployment/canary',
    title: 'Deploy',
    prompt: 'Package an approved model for the hospital VPC with a controlled rollout and rollback path.',
    constraints: ['Hospital VPC', 'Canary rollout', 'Approval required'],
    details: [['Service', 'Internal review API'], ['Current state', 'Canary waits on approval'], ['Rollback', 'Previous model remains available']],
    questions: ['Who can approve the production release?', 'What canary threshold should stop the rollout?'],
  },
  {
    projectPath: 'monitoring/feedback',
    title: 'Improve',
    prompt: 'Keep outcomes, drift signals and feedback connected to the next experiment.',
    constraints: ['Monitor real outcomes', 'Track model versions', 'Feed findings into the next run'],
    details: [['Signal', 'Sensitivity and review feedback'], ['Lineage', 'Model → config → data → evaluation'], ['Next step', 'Create an experiment from new evidence']],
    questions: ['How often should performance be reviewed?', 'Which outcomes should trigger a new evaluation?'],
  },
];
const approachChoices = [
  ['Prompting', 'An existing model with carefully designed instructions and evaluation.', 'Clear instructions, eval set'],
  ['Retrieval (RAG)', 'Ground answers in retrieved, current information.', 'Indexed sources, retrieval evals', 'worth evaluating'],
  ['PEFT / LoRA', 'Adapt a base model with a small set of trained parameters.', 'Labelled data, modest GPUs'],
  ['Full fine-tune', 'Update all weights when adaptation must go deeper.', 'More data, more compute'],
  ['Distillation', "Train a smaller model to reproduce a larger one's behaviour.", 'Teacher outputs, eval parity', 'worth evaluating'],
  ['Routing', 'Send each request to the model that fits its difficulty.', 'Classifier, per-route evals', 'worth evaluating'],
];
const faq = [
  ['Can I use Hyperparameter today?', 'Not yet. Hyperparameter is in development. The workspace and workflow shown here are design illustrations, not a live product. Join the waitlist for updates as the build progresses.'],
  ['Does it train a model for every idea?', 'No. Many objectives are better served by prompting, retrieval, or routing an existing model. The intended workflow starts with your requirement and evaluates which approach fits.'],
  ['Which models, clouds and tools will it support?', 'No specific integrations have been announced. The technical direction is to coordinate the work and execution layer while keeping choices visible; support details will be shared when they are confirmed.'],
  ['How is this different from an AI coding assistant?', 'A coding assistant helps produce code. Hyperparameter is being built to coordinate the engineering workflow around an AI system: dependencies, data, runs, evaluation, deployment and the context between them.'],
  ['Will everyone on the waitlist get access?', 'Not necessarily. The waitlist is open, but access timing and availability have not been announced. We will share early-access updates as there is something ready to use.'],
];

function Logo() {
  return <a href="#top" className="brand" data-testid="link-home"><span className="brand-mark">H</span><span>hyperparameter</span></a>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="topbar"><div className="topbar-inner">
    <Logo />
    <nav className="nav" aria-label="Main navigation">{navItems.map(([label, href]) => <a key={href} href={href} data-testid={`nav-${label.toLowerCase()}`}>{label}</a>)}</nav>
    <div className="nav-right"><span className="status"><i />Now building</span><a className="pill-btn" href={formUrl} target="_blank" rel="noreferrer" data-testid="button-header-waitlist">Join waitlist <ArrowUpRight size={13} /></a><button className="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu"><Menu size={19} /></button></div>
    {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>}
  </div></header>;
}

function Ticker() {
  const words = ['Problem definition', 'Data preparation', 'Approach selection', 'Experimentation', 'Training', 'Evaluation', 'Deployment', 'Monitoring', 'Improvement'];
  return <div className="ticker" aria-label="Engineering workflow ticker"><div className="ticker-track">{[0, 1].map(n => <div className="ticker-group" key={n} style={{ display: 'flex' }}>{words.map((w) => <span className="ticker-item" key={`${n}-${w}`}>{w}<i>→</i></span>)}</div>)}</div></div>;
}

function Problem() {
  return <section className="section" id="problem" data-testid="section-problem"><div className="wrap">
    <div className="problem-layout"><div><div className="section-head"><span>01</span> The problem</div><h2>The model is<br />the easy part.</h2><div className="body-copy"><p>Models are more accessible than ever. Turning one into a reliable system still means choosing an approach, preparing data, configuring experiments, provisioning compute, evaluating results and maintaining a deployment.</p><p>Each step usually lives in a different tool. The developer is the integration layer, tracking which config produced which checkpoint, which data it saw and whether it actually met the requirement.</p></div>
      <div className="audiences"><div className="audience"><span className="micro">Founders &amp; small teams</span><p>Know the customer problem deeply, but can't staff every part of an ML stack.</p></div><div className="audience"><span className="micro">Experienced ML engineers</span><p>Lose hours to repeated coordination and glue work instead of the hard problems.</p></div></div>
    </div><div className="artifact-board"><div className="board-head"><span>one_ai_system/</span><span>held together by you</span></div><div className="artifact-grid">{artifacts.map(([name, desc], i) => <div className="artifact" key={name}><span className="artifact-num">{i + 1}</span><span><strong>{name}</strong><small>{desc}</small></span></div>)}</div><p className="board-note">Scroll to see the same eight artifacts ordered by the stage they serve. Hyperparameter is being built so this order, and the context between steps, is kept by the system instead of in someone's head.</p></div></div>
  </div></section>;
}

function Thesis() {
  const rows = [
    ['Starting point', 'A prompt describing code', 'An objective with constraints'],
    ['Unit of work', 'A file or function', 'A dependency graph of engineering tasks'],
    ['Question it answers', 'What should this code look like?', 'What has to happen, in what order, and did it work?'],
    ['Done means', 'The code runs', 'The system meets the requirement on real evaluation'],
    ['Memory', 'The current conversation', 'Configs, data, runs, artifacts and results, linked'],
  ];
  return <section className="section thesis" id="thesis" data-testid="section-thesis"><div className="wrap"><div className="section-head"><span>02</span> The thesis</div><h2 className="thesis-title">Building AI systems is an<br />engineering workflow, <span>not a model-selection problem.</span></h2><div className="thesis-grid"><p className="body-copy">Hyperparameter is not an AI that generates code. It is being built to coordinate the technical work required to build, evaluate, deploy and improve AI systems, with your objective as the starting point and every decision kept visible.</p>
      <div className="compare" role="table" aria-label="Code generation versus Hyperparameter">{[['', 'Code generation', 'Hyperparameter'], ...rows].map((r, i) => <div className="compare-row" role="row" key={i}><div className={i === 0 ? 'rowlabel colhead' : 'rowlabel'}>{r[0]}</div><div className={i === 0 ? 'colhead' : ''}>{r[1]}</div><div className={i === 0 ? 'colhead' : ''}>{r[2]}</div></div>)}</div>
    </div></div></section>;
}

function Workflow() {
  const [active, setActive] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const paused = pointerInside || focusWithin;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      !sectionVisible ||
      paused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % stages.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [sectionVisible, paused]);

  const panel = workflowPanels[active];

  return (
    <section
      ref={sectionRef}
      className="section"
      id="workflow"
      data-testid="section-workflow"
    >
      <div className="wrap">
        <div className="section-head"><span>03</span> How it's intended to work</div>
        <h2 className="workflow-title">One outcome. An agent on every stage.</h2>
        <p className="workflow-sub">
          Follow one example project, the Medical Vision Model from the workspace above, through each stage Hyperparameter is being designed to coordinate.
        </p>
        <div
          className="workflow-layout"
          onMouseEnter={() => setPointerInside(true)}
          onMouseLeave={() => setPointerInside(false)}
          onFocusCapture={() => setFocusWithin(true)}
          onBlurCapture={(event) => {
            const nextFocus = event.relatedTarget;
            if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
              setFocusWithin(false);
            }
          }}
        >
          <div className="stage-list" role="tablist" aria-label="Workflow stages">
            {stages.map(([number, title, description], index) => (
              <button
                type="button"
                id={`stage-tab-${number}`}
                className={`stage-item ${index < active ? 'is-complete' : index === active ? 'is-current' : 'is-upcoming'}`}
                key={number}
                role="tab"
                aria-selected={active === index}
                aria-controls="workflow-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
                  event.preventDefault();
                  const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
                  const nextIndex = (index + direction + stages.length) % stages.length;
                  setActive(nextIndex);
                  document.getElementById(`stage-tab-${stages[nextIndex][0]}`)?.focus();
                }}
                data-testid={`stage-${number}`}
              >
                <span className="stage-number">{number}</span>
                <span className="stage-copy">
                  <span className="stage-name">{title}</span>
                  {active === index && <small>{description}</small>}
                </span>
              </button>
            ))}
          </div>
          <div
            key={active}
            className="objective-card workflow-panel-swap"
            id="workflow-panel"
            role="tabpanel"
            aria-labelledby={`stage-tab-${stages[active][0]}`}
          >
            <div className="objective-top">
              <span className="objective-path"><b>H</b> medical-vision-model / {panel.projectPath}</span>
              <div className="chips"><span className="chip">Interpreted</span><span className="chip">Illustrative</span></div>
            </div>
            <div className="objective-form">
              <label className="field-label" htmlFor="workflow-objective">{panel.title}</label>
              <textarea id="workflow-objective" className="objective-input" rows={2} readOnly value={panel.prompt} />
              <div className="constraint-list">
                {panel.constraints.map((constraint) => <span key={constraint}>{constraint}</span>)}
              </div>
            </div>
            <div className="objective-bottom">
              <div>
                <h4>Interpreted as</h4>
                {panel.details.map(([label, value]) => (
                  <div className="detail-row" key={label}><span>{label}</span><strong>{value}</strong></div>
                ))}
              </div>
              <div>
                <h4>Missing information</h4>
                <div className="missing-list">
                  {panel.questions.map((question) => <div className="missing-question" key={question}><span aria-hidden="true">!</span>{question}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Approach() {
  const prompts = ['A capable existing model already does the task with good instructions', 'Answers depend on private or frequently changing documents', 'You have labelled examples of the behaviour you want', 'The domain or output format differs substantially from general models', 'Latency or cost per request is a hard constraint', 'Requests vary widely in difficulty'];
  const [selectedPrompts, setSelectedPrompts] = useState<number[]>([4]);
  const [hoveredPrompt, setHoveredPrompt] = useState<number | null>(null);
  const approachForPrompt = [0, 1, 2, 3, 4, 5];
  const recommended = new Set([
    ...selectedPrompts.map((index) => approachForPrompt[index]),
    ...(hoveredPrompt === null ? [] : [approachForPrompt[hoveredPrompt]]),
  ]);

  return <section className="section approach" id="approach" data-testid="section-approach"><div className="wrap"><div className="section-head"><span>04</span> Approach selection</div><h2>Not every problem needs<br />a new model.</h2><p className="body-copy" style={{ maxWidth: 670 }}>The right approach depends on the objective, the data you have, quality targets, latency, cost, privacy and where it has to run. Hyperparameter is being built to help navigate that decision, then coordinate whichever path it leads to.</p>
    <div className="approach-layout"><div className="prompt-panel"><div className="objective-top"><strong>What's true of your problem?</strong><span className="chip">Illustrative</span></div><div className="prompt-list" role="group" aria-label="Conditions that shape the AI approach">{prompts.map((p, i) => {
      const selected = selectedPrompts.includes(i);
      return <button type="button" className={`prompt${selected ? ' is-selected' : ''}`} key={p} aria-pressed={selected} onClick={() => setSelectedPrompts((current) => selected ? current.filter((index) => index !== i) : [...current, i])} onMouseEnter={() => setHoveredPrompt(i)} onMouseLeave={() => setHoveredPrompt(null)} data-testid={`approach-prompt-${i}`}><span className="prompt-check" aria-hidden="true">{selected ? '✓' : ''}</span><span>{p}</span></button>;
    })}</div></div>
      <div><div className="choices">{approachChoices.map(([title, desc, needs, worth], index) => <article className={`choice${recommended.has(index) ? ' is-recommended' : ''}`} key={title}><h3>{title}{worth && <span className="worth">{worth}</span>}</h3><p>{desc}</p><span className="needs">needs · {needs}</span></article>)}</div><p className="simplified">A simplified heuristic for illustration. In practice these options combine, and the final call is made by evaluating candidates against your requirement.</p></div></div></div></section>;
}

function Infrastructure() {
  const panels: [string, string, ReactNode][] = [
    ['Compute provisioning', "Training and serving have different GPU and memory profiles. Resources are allocated to the job, not to a person's console tab.", <div className="compute-matrix">{[['train · run-2', 8, 'primary'], ['eval · regression', 3, 'muted'], ['serve · canary', 2, 'soft'], ['idle', 0, 'idle']].map(([label, count, tone]) => <div className="compute-row" key={label as string}><span>{label}</span><div className="compute-cells">{Array.from({ length: 8 }, (_, i) => <i key={i} className={i < Number(count) ? `is-${tone}` : ''} />)}</div></div>)}</div>],
    ['Scheduling', 'Jobs run when their dependencies are satisfied.', <div className="code-list schedule-list"><div><span>data/dedupe</span><b className="schedule-done">done</b></div><div><span>train/run-2</span><b className="schedule-running">running</b></div><div><span>eval/regression</span><b>queued</b></div><div><span>serve/canary</span><b className="schedule-waiting">waits on gate</b></div></div>],
    ['Artifacts & lineage', 'Every model version traces back to its config, data and evaluation.', <div className="lineage-list">{['sweep_lora.yaml', 'ChestX-ray v1', 'run-2', 'ckpt-18400', 'eval · latest', 'model v2'].map((item) => <span key={item}>{item}</span>)}</div>],
    ['State & persistence', 'Long-running jobs checkpoint and resume after failure or preemption.', <div className="state-timeline"><div className="timeline-track"><i /><i /><i className="is-waiting" /><i /><i className="is-pending" /></div><div><span>ckpt saved</span><b>preempted · resume</b><span>next</span></div></div>],
    ['Permissions', 'Access to data, secrets and production is scoped and enforced.', <div className="code-list"><div>datasets/hospital　owner: rw · team: r</div><div>secrets/registry　service only</div><div>deploy/prod　approval required</div></div>],
    ['Cost & operational visibility', 'Understand where compute goes across training, evaluation and serving, per project.', <div className="bars">{[['Training', '63%'], ['Evaluation', '24%'], ['Serving', '13%']].map(([n, w]) => <div key={n}><div className="barline"><span>{n}</span><span>share of compute</span></div><div className="bar"><i style={{ width: w }} /></div></div>)}</div>],
  ];
  return <section className="section infrastructure-section" id="infrastructure" data-testid="section-infrastructure"><div className="wrap">
    <div className="infra-intro"><div><div className="section-head"><span>05</span> The infrastructure underneath</div><h2>Planning is half of it.<br /><span>Execution is the rest.</span></h2></div><div className="infra-intro-copy"><p>A plan is only useful if something can run it. Hyperparameter's technical direction includes the execution and orchestration layer itself, not a conversational interface placed on top of unrelated tools.</p><span className="infra-label">Illustrative</span></div></div>
    <div className="infra-grid">{panels.map(([title, copy, diagram], index) => <article className={`infra-card infra-card-${index + 1}`} key={title}><h3><span className="infra-icon" aria-hidden="true">{['◉', '≡', '⌁', '◌', '◇', '◔'][index]}</span>{title}</h3><p>{copy}</p>{diagram}</article>)}</div>
  </div></section>;
}

function Definition() {
  const statements = [
    ['A chatbot that writes code', 'Code is one output. Coordinating the work is the product.'],
    ['A prompt library', 'Prompting is one approach among several.'],
    ['A wrapper around one model provider', 'The approach follows the requirement, not a vendor.'],
    ['A generic no-code builder', 'Engineering decisions stay visible and controllable.'],
    ['A standalone model-hosting service', 'Serving is one stage, linked to what came before.'],
    ['A fine-tune-everything interface', "Many problems don't need training at all."],
    ['A bundle of disconnected ML tools', 'The value is in the connections between stages.'],
  ];
  return <section className="section definition" id="definition" data-testid="section-definition"><div className="wrap"><div className="section-head"><span>06</span> Definition</div><div className="definition-layout"><div className="definition-copy"><h2>What it is.<br />What it isn't.</h2><div className="definition-summary"><p>An AI development and orchestration platform that connects the problem, approach, data, experiments, evaluation and deployment into one coherent process.</p></div></div><div className="definition-list">{statements.map(([title, copy]) => <div className="definition-item" key={title}><strong>{title}</strong><span>{copy}</span></div>)}</div></div></div></section>;
}

function ForWho() {
  const audiences: [string, string, string[]][] = [
    ['If you know ML deeply', 'ML engineers · AI engineers · researchers · data scientists', ['Control over approach, configs and compute', 'Reproducible runs with lineage you can inspect', 'Evaluation as a first-class gate, not an afterthought', 'Less glue code between stages']],
    ['If you know the problem deeply', 'Technical founders · independent developers · early AI startups', ['Start from the outcome, not from tool selection', 'Missing requirements surfaced early', 'See why a decision was made, in plain terms', 'A path to a usable API, not just a notebook']],
  ];
  return <section className="section" id="audience" data-testid="section-audience"><div className="wrap"><div className="section-head"><span>07</span> Who it's for</div><h2>For people building<br />custom AI systems.</h2><div className="for-layout">{audiences.map(([title, subtitle, list]) => <article className="for-card" key={title}><h3>{title}</h3><p className="subtitle">{subtitle}</p><ul>{list.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div></div></section>;
}

function WhereWeAre() {
  return <section className="section status-section" id="status" data-testid="section-status"><div className="wrap"><div className="section-head"><span>08</span> Where we are</div><div className="definition-layout"><div><h2>Early, and honest<br />about it.</h2><p className="body-copy">Everything on this page describes what Hyperparameter is being built to do. No customers, benchmarks or integrations are claimed, because none have been announced.</p></div><div className="status-table">{[['Product', 'In development'], ['Workspace shown', 'Design mockup'], ['Workflow panels', 'Illustrative'], ['Waitlist', 'Open']].map(([a, b]) => <div className="status-row" key={a}><span>{a}</span><strong>{b}</strong></div>)}</div></div></div></section>;
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return <section className="section" id="faq" data-testid="section-faq"><div className="wrap"><div className="section-head"><span>FAQ</span> Frequently asked</div><h2>Clear answers, for now.</h2><div className="faq-list">{faq.map(([q, a], i) => <div className="faq-item" key={q}><button className="faq-question" aria-expanded={open === i} aria-controls={`faq-answer-${i}`} id={`faq-question-${i}`} onClick={() => setOpen(open === i ? null : i)} data-testid={`faq-question-${i}`}><span>{q}</span><span aria-hidden="true">+</span></button>{open === i && <div className="faq-answer" id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`}>{a}</div>}</div>)}</div></div></section>;
}

function FinalCTA() {
  return <footer className="final" id="waitlist" data-testid="section-waitlist"><div className="wrap"><div className="final-inner"><div><div className="section-head" style={{ color: '#9c9ca6' }}><span style={{ color: '#9c97ff' }}>Next</span> Early access</div><h2>Tell us what you're<br />trying to build.</h2><p className="final-copy">If coordinating AI development is the part slowing you down, join the waitlist. It takes about a minute and goes straight to the team.</p><a className="pill-btn" href={formUrl} target="_blank" rel="noreferrer" data-testid="button-final-waitlist">Join the waitlist <ArrowUpRight size={14} /></a><span className="type-note">Opens a short Typeform</span></div><div className="final-notes">{[['Follow the build', 'Updates as the workflow, evaluation and infrastructure layers take shape.'], ['Hear about early access', "Be told when there's something you can use."], ['Shape what we build first', 'Tell us your objective. It directly informs priorities.']].map(([t, c]) => <div className="final-note" key={t}><strong>{t}</strong><span>{c}</span></div>)}</div></div><div className="footer"><Logo /><span>© Hyperparameter · Now building</span><a href="#top">Back to top ↑</a></div></div></footer>;
}

function App() {
  return <div className="site" id="top"><Header /><main><section className="hero grid-bg" data-testid="section-hero"><div className="wrap"><div className="eyebrow reveal"><b>EARLY ACCESS</b><span>Human-in-the-loop AI engineering</span></div><h1>Describe the outcome.<span>Watch it get engineered.</span></h1><HeroAgentStatus /><p className="hero-copy">Hyperparameter's agents do the heavy lifting of building custom AI, from scoping and data to training, evals and deployment. Every plan, run and result is visible as it happens, and nothing ships until you sign off.</p><div className="hero-actions"><a className="pill-btn" href={formUrl} target="_blank" rel="noreferrer" data-testid="button-hero-waitlist">Join the waitlist <ArrowUpRight size={13} /></a><a className="secondary-btn" href="#workflow" data-testid="button-see-workflow">See how it works <ArrowDown size={13} /></a></div><div className="trust"><span><ShieldCheck size={12} />You approve every gate</span><span><RotateCw size={12} />Every run logged and reproducible</span><span><KeyRound size={12} />Your data, models and keys stay yours</span></div><DashboardVisual /></div></section><Ticker /><Problem /><Thesis /><Workflow /><Approach /><Infrastructure /><Definition /><ForWho /><WhereWeAre /><FAQ /></main><FinalCTA /></div>;
}

export default App;
