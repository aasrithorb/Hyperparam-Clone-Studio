import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Menu, ShieldCheck, KeyRound, RotateCw } from 'lucide-react';

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

function DashboardVisual() {
  return <div className="workspace" data-testid="visual-workspace">
    <div className="laptop"><div className="screen">
      <aside className="dash-sidebar"><div className="dash-logo">H　 hyperparameter</div>{['⌂　 Home', '▧　 Projects', '▤　 Datasets', '◇　 Models', '⌁　 Experiments', '▥　 Evaluations', '⌘　 Integrations', '♙　 Team', '⚙　 Settings'].map((t, i) => <div className={`dash-nav ${i === 0 ? 'active' : ''}`} key={t}>{t}</div>)}</aside>
      <main className="dash-main"><div className="dash-head"><div><div className="dash-muted">⌕　Search projects, datasets, models...</div><h3 style={{ marginTop: 16 }}>Good evening, Aasrith</h3><span className="dash-muted">Turn your ideas into real AI systems.</span></div><span className="new-project">＋ New project</span></div>
        <div className="stats">{[['Projects', '6'], ['Datasets', '12'], ['Models', '5'], ['Compute hours', '428']].map(([a, b]) => <div className="stat" key={a}>{a}<strong>{b}</strong></div>)}</div>
        <div className="project-card"><div className="project-top"><b>▣　Current Project</b><span className="dash-muted">Edit　● Training</span></div><div className="project-name"><div className="project-thumb" /><div><b>Medical Vision Model</b><div className="dash-muted">A domain-specific model for detecting lung abnormalities in chest X-rays.</div></div></div>
          <div className="steps"><b>① Idea</b><b>② Data</b><b>③ Model</b><b>④ Train</b><span>⑤ Evaluate</span><span>⑥ Deploy</span></div>
          <div className="chartbox"><b>Training metrics　　Loss</b><div className="chartline" /></div>
        </div>
      </main>
      <aside className="activity"><h4>Recent activity</h4>{['Training run #3 started', 'Dataset ‘ChestX-ray v1’ added', 'Evaluation completed', 'New model version saved', 'Deployment configured'].map((t, i) => <div className="activity-item" key={t}><span className="activity-dot">{['▶', '▤', '▥', '◇', '⌘'][i]}</span><span>{t}<br /><small className="dash-muted">{i + 1} hours ago</small></span></div>)}<h4 style={{ marginTop: 18 }}>Datasets</h4><div className="activity-item">▤　ChestX-ray v1</div></aside>
    </div><div className="laptop-base" /></div>
    <div className="callout c1"><b>01 Pipeline state</b>Idea → Data → Model → Train → Evaluate → Deploy, tracked per project</div>
    <div className="callout c2"><b>02 Run context</b>Steps, GPU utilisation and loss stay attached to the run</div>
    <div className="callout c3"><b>03 Evaluation</b>Latest eval sits next to the run that produced it</div>
  </div>;
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
  return <section className="section" id="workflow" data-testid="section-workflow"><div className="wrap"><div className="section-head"><span>03</span> How it's intended to work</div><h2 className="workflow-title">One outcome. An agent on every stage.</h2><p className="workflow-sub">Follow one example project, the Medical Vision Model from the workspace above, through each stage Hyperparameter is being designed to coordinate.</p>
    <div className="workflow-layout"><div className="stage-list" role="tablist" aria-label="Workflow stages">{stages.map(([n, title], i) => <button type="button" className="stage-item" key={n} role="tab" aria-selected={active === i} onClick={() => setActive(i)} data-testid={`stage-${n}`}><b>{n.padStart(2, '0')}</b>{title}</button>)}</div>
      <div className="objective-card" role="tabpanel"><div className="objective-top"><span>medical-vision-model/{stages[active][1].toLowerCase()}</span><div className="chips"><span className="chip">Interpreted</span><span className="chip">Illustrative</span></div></div><h3>{active === 0 ? 'Objective' : stages[active][1]}</h3><p className="quote">{active === 0 ? 'Flag likely lung abnormalities in chest X-rays so radiologists can prioritise their review queue.' : stages[active][2]}</p>
        <div className="constraint-list"><span>Runs inside hospital VPC</span><span>p50 latency under 500 ms</span><span>Assistive only, never auto-diagnoses</span></div>
        <div className="objective-bottom"><div><h4>Interpreted as</h4><div className="detail-row"><strong>Task —</strong> Multi-label image classification</div><div className="detail-row"><strong>Output —</strong> Findings + confidence, routed to review</div><div className="detail-row"><strong>Metric that matters —</strong> Sensitivity on held-out hospital data</div></div><div><h4>Missing information</h4><div className="detail-row">How many hospital images carry radiologist-confirmed labels?</div><div className="detail-row">Are all findings in scope, or a priority subset?</div></div></div>
      </div></div></div></section>;
}

function Approach() {
  const prompts = ['A capable existing model already does the task with good instructions', 'Answers depend on private or frequently changing documents', 'You have labelled examples of the behaviour you want', 'The domain or output format differs substantially from general models', 'Latency or cost per request is a hard constraint', 'Requests vary widely in difficulty'];
  return <section className="section approach" id="approach" data-testid="section-approach"><div className="wrap"><div className="section-head"><span>04</span> Approach selection</div><h2>Not every problem needs<br />a new model.</h2><p className="body-copy" style={{ maxWidth: 670 }}>The right approach depends on the objective, the data you have, quality targets, latency, cost, privacy and where it has to run. Hyperparameter is being built to help navigate that decision, then coordinate whichever path it leads to.</p>
    <div className="approach-layout"><div><div className="objective-top"><strong>What's true of your problem?</strong><span className="chip">Illustrative</span></div><div className="prompt-list">{prompts.map((p, i) => <div className="prompt" key={p} data-testid={`approach-prompt-${i}`}>{p}</div>)}</div></div>
      <div><div className="choices">{approachChoices.map(([title, desc, needs, worth]) => <article className="choice" key={title}><h3>{title}{worth && <span className="worth">{worth}</span>}</h3><p>{desc}</p><span className="needs">needs · {needs}</span></article>)}</div><p className="simplified">A simplified heuristic for illustration. In practice these options combine, and the final call is made by evaluating candidates against your requirement.</p></div></div></div></section>;
}

function Infrastructure() {
  const panels: [string, string, ReactNode][] = [
    ['Compute provisioning', "Training and serving have different GPU and memory profiles. Resources are allocated to the job, not to a person's console tab.", <div className="code-list"><div><span className="state-dot" />train · run-2 <span style={{ float: 'right' }}>A100 · 80GB</span></div><div><span className="state-dot" />eval · regression</div><div><span className="state-dot" />serve · canary</div><div>idle</div></div>],
    ['Scheduling', 'Jobs run when their dependencies are satisfied.', <div className="code-list"><div>01　data/dedupe <span style={{ color: '#55a883' }}>done</span></div><div>02　train/run-2 <span style={{ color: '#5148e7' }}>running</span></div><div>03　eval/regression queued</div><div>04　serve/canary waits on gate</div></div>],
    ['Artifacts & lineage', 'Every model version traces back to its config, data and evaluation.', <div className="code-list"><div>sweep_lora.yaml　→</div><div>ChestX-ray v1　→　run-2</div><div>ckpt-18400　→　eval · latest</div><div>model v2</div></div>],
    ['State & persistence', 'Long-running jobs checkpoint and resume after failure or preemption.', <div className="code-list"><div>run-2 / training</div><div>checkpoint　ckpt-18400</div><div><span className="state-dot" />ckpt saved / preempted</div><div>resume next</div></div>],
    ['Permissions', 'Access to data, secrets and production is scoped and enforced.', <div className="code-list"><div>datasets/hospital　owner: rw · team: r</div><div>secrets/registry　service only</div><div>deploy/prod　approval required</div></div>],
    ['Cost & operational visibility', 'Understand where compute goes across training, evaluation and serving, per project.', <div className="bars">{[['Training', '63%'], ['Evaluation', '24%'], ['Serving', '13%']].map(([n, w]) => <div key={n}><div className="barline"><span>{n} / share of compute</span><span>{w}</span></div><div className="bar"><i style={{ width: w }} /></div></div>)}</div>],
  ];
  return <section className="section" id="infrastructure" data-testid="section-infrastructure"><div className="wrap"><div className="section-head"><span>05</span> The infrastructure underneath</div><h2>Planning is half of it.<br />Execution is the rest.</h2><p className="body-copy" style={{ maxWidth: 670 }}>A plan is only useful if something can run it. Hyperparameter's technical direction includes the execution and orchestration layer itself, not a conversational interface placed on top of unrelated tools.</p><div className="infra-grid">{panels.map(([title, copy, diagram]) => <article className="infra-card" key={title}><span className="infra-label">Illustrative</span><h3>{title}</h3><p>{copy}</p>{diagram}</article>)}</div></div></section>;
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
  return <section className="section definition" id="definition" data-testid="section-definition"><div className="wrap"><div className="section-head"><span>06</span> Definition</div><div className="definition-layout"><div><h2>What it is.<br />What it isn't.</h2><p className="body-copy">An AI development and orchestration platform that connects the problem, approach, data, experiments, evaluation and deployment into one coherent process.</p></div><div className="definition-list">{statements.map(([title, copy]) => <div className="definition-item" key={title}><strong>{title}</strong><span>{copy}</span></div>)}</div></div></div></section>;
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
  return <div className="site" id="top"><Header /><main><section className="hero grid-bg" data-testid="section-hero"><div className="wrap"><div className="eyebrow reveal"><b>EARLY ACCESS</b><span>Human-in-the-loop AI engineering</span></div><h1>Describe the outcome.<span>Watch it get engineered.</span></h1><div className="agent-chip"><i />planner-agent <span>›</span> <strong>scoping the outcome</strong></div><p className="hero-copy">Hyperparameter's agents do the heavy lifting of building custom AI, from scoping and data to training, evals and deployment. Every plan, run and result is visible as it happens, and nothing ships until you sign off.</p><div className="hero-actions"><a className="pill-btn" href={formUrl} target="_blank" rel="noreferrer" data-testid="button-hero-waitlist">Join the waitlist <ArrowUpRight size={13} /></a><a className="secondary-btn" href="#workflow" data-testid="button-see-workflow">See how it works <ArrowDown size={13} /></a></div><div className="trust"><span><ShieldCheck size={12} />You approve every gate</span><span><RotateCw size={12} />Every run logged and reproducible</span><span><KeyRound size={12} />Your data, models and keys stay yours</span></div><DashboardVisual /></div></section><Ticker /><Problem /><Thesis /><Workflow /><Approach /><Infrastructure /><Definition /><ForWho /><WhereWeAre /><FAQ /></main><FinalCTA /></div>;
}

export default App;
