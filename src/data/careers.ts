/**
 * Careers — single source of truth.
 *
 * Everything in the careers section (the board, the filters, each role page,
 * the apply form, and the JobPosting structured data) reads from this file,
 * so a role can never appear in one place and be missing from another.
 *
 * Editorial rule: no compensation claims anywhere — no salary bands, no
 * "competitive" language. Terms are confirmed in the intro call, which is
 * step 1 of every role's published hiring process.
 */

export type DepartmentId = 'marketing' | 'design' | 'engineering' | 'operations';

export type EmploymentType = 'Full-time' | 'Internship' | 'Contract';

export interface Department {
  id: DepartmentId;
  label: string;
  /** Shown under the department heading on the board. */
  blurb: string;
}

export interface Role {
  slug: string;
  title: string;
  department: DepartmentId;
  team: string;
  location: string;
  type: EmploymentType;
  /** Pins the role to the top of the board and shows a "Priority hire" badge. */
  priority?: boolean;
  /** One-line hook used on the role card and as the meta description. */
  summary: string;
  /** Opening paragraphs on the role page. */
  about: string[];
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  /** What the person gets out of it — growth, ownership, exposure. */
  whatYoullGet: string[];
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'marketing',
    label: 'Marketing & Growth',
    blurb: 'Getting Lumicoria in front of the people whose work it changes.',
  },
  {
    id: 'design',
    label: 'Design',
    blurb: 'Making powerful AI feel obvious, calm, and human.',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    blurb: 'Building the platform that runs agents in production.',
  },
  {
    id: 'operations',
    label: 'Operations & GTM',
    blurb: 'Turning early interest into customers who stay.',
  },
];

/** Why join — deliberately about growth, ownership and craft, not money. */
export const BENEFITS = [
  {
    icon: 'Target',
    title: 'Real ownership, immediately',
    description:
      'You will not be the fifth person on a feature. You own a surface, make the call, and see it ship — usually within the same week.',
  },
  {
    icon: 'Rocket',
    title: 'Your work goes live at launch',
    description:
      'We are pre-launch. What you build or design becomes the thing the world sees first, not something buried in a backlog.',
  },
  {
    icon: 'GraduationCap',
    title: 'Direct mentorship',
    description:
      'You work directly with the founder on production AI systems — architecture, evaluation, and the tradeoffs that only show up at scale.',
  },
  {
    icon: 'Sparkles',
    title: 'Frontier AI tooling',
    description:
      'Hands-on access to the current generation of models and agent tooling, as part of the daily job rather than a side experiment.',
  },
  {
    icon: 'Globe',
    title: 'Remote-first and async',
    description:
      'Work from wherever you are. We optimise for written clarity and deep focus over meetings and status calls.',
  },
  {
    icon: 'FolderOpen',
    title: 'Portfolio-grade work',
    description:
      'Public, shippable work you can show — plus a written recommendation from the founder when you have earned one.',
  },
  {
    icon: 'Users',
    title: 'A small, high-trust team',
    description:
      'Low ego, low process, high standards. Opinions are argued on merit and decisions are made quickly.',
  },
  {
    icon: 'Compass',
    title: 'A say in where this goes',
    description:
      'Early team members shape the product, the culture, and the way we work — not just the tickets.',
  },
];

/**
 * Published hiring process. Step 1 is intentionally an intro call that
 * confirms scope and terms, so candidates understand the arrangement before
 * investing significant time in later stages.
 */
export const HIRING_PROCESS = [
  {
    step: '01',
    title: 'Apply',
    description:
      'Send us your work. A portfolio, repo, campaign, or writing sample tells us far more than a polished CV.',
  },
  {
    step: '02',
    title: 'Intro call — 20 minutes',
    description:
      'A short conversation about the role, what the first month looks like, your expectations and ours, and the terms of the engagement. Ask us anything.',
  },
  {
    step: '03',
    title: 'Practical exercise',
    description:
      'A small, realistic task close to the actual work — timeboxed, and we tell you exactly what we are looking for. We never ask for free work we would ship.',
  },
  {
    step: '04',
    title: 'Final conversation',
    description:
      'A deeper session on how you think, how you would approach the first 30 days, and how we would work together.',
  },
  {
    step: '05',
    title: 'Decision',
    description:
      'We come back to you either way, with a reason. No silence, no ghosting.',
  },
];

export const ROLES: Role[] = [
  // ── Marketing & Growth ──────────────────────────────────────────────
  {
    slug: 'social-media-manager',
    title: 'Social Media Manager',
    department: 'marketing',
    team: 'Marketing & Growth',
    location: 'Remote — global',
    type: 'Full-time',
    priority: true,
    summary:
      'Own the voice that introduces Lumicoria to the world, and turn attention into a community of people who actually use the product.',
    about: [
      'We are weeks from launch with a product we believe in and almost no audience yet. That is the problem you are here to solve.',
      'This is not a scheduling job. You will decide what Lumicoria sounds like in public, which platforms are worth our time, and what we say to earn the first thousand people who care. You will have the freedom to run experiments and the responsibility for what they produce.',
    ],
    responsibilities: [
      'Own the content calendar end to end across X, LinkedIn, Instagram, and TikTok',
      'Write and ship posts daily — hooks, threads, short-form video scripts, launch announcements',
      'Define and hold a consistent brand voice that sounds like a person, not a press release',
      'Grow and engage a community: reply, start conversations, bring people into the product',
      'Plan and run the launch campaign with the founder and design',
      'Track what actually works — reach, engagement, signups — and cut what does not',
      'Spot cultural moments quickly and turn them into relevant content',
    ],
    requirements: [
      'Demonstrable experience growing a social account or community from a standing start',
      'Genuinely strong writing — you can make a technical idea land in one sentence',
      'Fluent in how X, LinkedIn, Instagram, and TikTok each actually behave',
      'Comfortable shipping daily and iterating in public',
      'Self-directed: you decide what to post without waiting to be briefed',
    ],
    niceToHave: [
      'You have marketed a technical or AI product before',
      'You can shoot and edit short-form video yourself',
      'Basic design skills in Figma or Canva for quick assets',
      'Existing audience or community of your own',
    ],
    whatYoullGet: [
      'Full ownership of the public voice of a company at launch',
      'A launch campaign in your portfolio, from strategy to execution',
      'Direct line to the founder — no approval layers between you and shipping',
      'Freedom to experiment and the budget of attention to do it',
    ],
  },
  {
    slug: 'content-community-manager',
    title: 'Content & Community Manager',
    department: 'marketing',
    team: 'Marketing & Growth',
    location: 'Remote — global',
    type: 'Full-time',
    summary:
      'Write the long-form work that earns trust, and look after the people who show up because of it.',
    about: [
      'Social gets attention; content is what makes people stay and believe. You will own the blog, docs-adjacent explainers, and the places our early users gather.',
    ],
    responsibilities: [
      'Write long-form posts, case studies, and product explainers',
      'Own our SEO and content strategy from keyword to published piece',
      'Build and moderate our community spaces, and set their tone',
      'Turn user questions and support themes into public content',
      'Work with design on visuals that make complex ideas readable',
    ],
    requirements: [
      'A portfolio of published writing you are proud of',
      'You can explain a technical concept without dumbing it down',
      'Working understanding of SEO and content distribution',
      'Comfortable talking to users directly, in public',
    ],
    niceToHave: [
      'Experience writing for a developer or AI audience',
      'You have moderated a community through its awkward early phase',
      'Basic video or podcast production',
    ],
    whatYoullGet: [
      'Editorial ownership — you set the standard for how we write',
      'A published body of work with your name on it',
      'Close involvement in product decisions through user feedback',
    ],
  },
  {
    slug: 'growth-marketing-intern',
    title: 'Growth Marketing Intern',
    department: 'marketing',
    team: 'Marketing & Growth',
    location: 'Remote — global',
    type: 'Internship',
    summary:
      'Learn growth by doing it — real experiments, real numbers, on a product about to launch.',
    about: [
      'A hands-on internship for someone early in their career who wants to learn marketing by running it, not by watching. You will be given real experiments and real accountability, with guidance throughout.',
    ],
    responsibilities: [
      'Run growth experiments across channels and report honestly on what happened',
      'Support content production and the launch campaign',
      'Research competitors, audiences, and channels',
      'Maintain analytics dashboards and pull the weekly numbers',
    ],
    requirements: [
      'Strong written communication',
      'Curiosity about why things work, and comfort with being wrong',
      'Self-directed and reliable with deadlines in an async team',
    ],
    niceToHave: [
      'Personal projects, a newsletter, or an audience of your own',
      'Familiarity with analytics tooling',
    ],
    whatYoullGet: [
      'Mentorship directly from the founder',
      'Real experiments and real data in your portfolio',
      'A written recommendation on successful completion',
      'A path to a larger role as the company grows',
    ],
  },

  // ── Design ──────────────────────────────────────────────────────────
  {
    slug: 'user-experience-designer',
    title: 'Product Designer (UI/UX)',
    department: 'design',
    team: 'Design',
    location: 'Remote — global',
    type: 'Full-time',
    priority: true,
    summary:
      'Own the product experience end to end and make AI agents feel calm, obvious, and trustworthy to people who are not engineers.',
    about: [
      'AI products have a hard design problem: enormous capability behind an interface that usually overwhelms people. Most solve it by exposing everything and calling it power. We want the opposite.',
      'You will own the product experience across the platform — the agent builder, the workspace, onboarding — and decide how something genuinely complex becomes something a person can trust on the first try. This is a senior scope on a small team: you set the design direction, not just the screens.',
    ],
    responsibilities: [
      'Own end-to-end product design: research, flows, wireframes, high-fidelity UI, prototypes',
      'Design the core surfaces — agent builder, workspace, onboarding, dashboards',
      'Build and maintain the design system so the product stays coherent as it grows',
      'Turn genuinely complex agent behaviour into interfaces people understand immediately',
      'Work directly with engineering to make sure what ships matches the intent',
      'Test with real users and let the findings change your mind',
      'Raise the visual craft of the entire product, including the marketing site',
    ],
    requirements: [
      'A portfolio showing shipped product work — not just concepts or dribbble shots',
      'Real strength in interaction design and information hierarchy',
      'Fluent in Figma, including components, variants, and design systems',
      'You can explain why a design works, in terms of the user and the business',
      'Comfortable owning ambiguity and defining the problem yourself',
    ],
    niceToHave: [
      'You have designed for AI, data-heavy, or developer products',
      'You can write front-end code, or at least read it fluently',
      'Motion and prototyping skills',
      'Brand and identity experience',
    ],
    whatYoullGet: [
      'Design ownership of an entire product at the moment it launches',
      'Your design system and decisions become the foundation everything else builds on',
      'Direct collaboration with the founder — your work ships, it does not get diluted',
      'A launch-scale case study for your portfolio',
    ],
  },
  {
    slug: 'brand-visual-designer',
    title: 'Brand & Visual Designer',
    department: 'design',
    team: 'Design',
    location: 'Remote — global',
    type: 'Full-time',
    summary:
      'Give Lumicoria a visual identity people recognise instantly — and keep it consistent everywhere it appears.',
    about: [
      'We have a brand foundation and a launch coming. You will sharpen that identity and apply it across every surface people will see: the site, social, decks, product marketing, and launch assets.',
    ],
    responsibilities: [
      'Evolve and apply the visual identity across all brand surfaces',
      'Design launch assets: social graphics, site visuals, decks, and campaign material',
      'Create illustration and motion that explain the product',
      'Maintain brand guidelines so quality holds as more people create assets',
      'Partner with social and content on a steady flow of visual work',
    ],
    requirements: [
      'A portfolio with strong brand and visual systems work',
      'Excellent typography and layout instincts',
      'Fluent in Figma and the Adobe suite',
      'You can move fast on campaign work without losing craft',
    ],
    niceToHave: [
      'Motion design and animation',
      '3D or generative visual work',
      'You have taken a brand through a launch before',
    ],
    whatYoullGet: [
      'Ownership of how a company looks at the moment it becomes public',
      'A complete brand-launch case study',
      'Creative latitude — we hire for taste and then trust it',
    ],
  },
  {
    slug: 'design-intern',
    title: 'Design Intern',
    department: 'design',
    team: 'Design',
    location: 'Remote — global',
    type: 'Internship',
    summary:
      'Learn product and brand design on a real product, with real users, and real deadlines.',
    about: [
      'For a designer early in their career who wants their work in front of actual users rather than in a class project. You will be mentored closely and given genuine responsibility.',
    ],
    responsibilities: [
      'Support product and brand design across the platform and launch',
      'Produce social and marketing assets to brief',
      'Help build and maintain the design system',
      'Take part in user research and design critique',
    ],
    requirements: [
      'A portfolio or body of work showing real potential and taste',
      'Working knowledge of Figma',
      'Open to feedback and quick to iterate',
      'Reliable and self-directed in an async team',
    ],
    niceToHave: [
      'Illustration, motion, or front-end skills',
      'Personal design projects you can talk about',
    ],
    whatYoullGet: [
      'Direct mentorship on product and brand design',
      'Shipped work in your portfolio with real users behind it',
      'A written recommendation on successful completion',
      'A path to a larger role as the company grows',
    ],
  },

  // ── Engineering ─────────────────────────────────────────────────────
  {
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    department: 'engineering',
    team: 'Engineering',
    location: 'Remote — global',
    type: 'Full-time',
    summary:
      'Build the interfaces people use to create, run, and trust AI agents.',
    about: [
      'Our frontend is React, TypeScript, Tailwind, and Vite. You will build the surfaces where people actually do the work — the agent builder, the workspace, real-time run views — and care as much about how they feel as whether they function.',
    ],
    responsibilities: [
      'Build and maintain product surfaces in React and TypeScript',
      'Turn design into interfaces that are fast, accessible, and precise',
      'Handle real-time and streaming interfaces for live agent runs',
      'Keep the component library and frontend architecture healthy',
      'Own performance, accessibility, and cross-device behaviour',
    ],
    requirements: [
      'Strong React and TypeScript, with production work to show',
      'Real CSS skill — you can build what the design actually specified',
      'Understanding of state management, data fetching, and performance',
      'You care about the details others skip',
    ],
    niceToHave: [
      'Experience with streaming or real-time UI',
      'Design sensibility, or comfort working without pixel-perfect specs',
      'Open-source contributions',
    ],
    whatYoullGet: [
      'Ownership of the frontend architecture at an early stage',
      'Work on genuinely novel interface problems in AI',
      'Direct collaboration with design and the founder',
    ],
  },
  {
    slug: 'backend-engineer',
    title: 'Backend Engineer',
    department: 'engineering',
    team: 'Engineering',
    location: 'Remote — global',
    type: 'Full-time',
    summary:
      'Build the platform that runs AI agents reliably, at scale, in production.',
    about: [
      'Our backend is Python and FastAPI, with MongoDB, Postgres, Redis, and Celery. The hard problems here are reliability, orchestration, and cost — agents that run unattended have to be dependable.',
    ],
    responsibilities: [
      'Design and build APIs and services that power the platform',
      'Work on agent orchestration, scheduling, and background execution',
      'Integrate model providers and third-party systems',
      'Own reliability: retries, rate limits, failure handling, observability',
      'Model and evolve the data layer as the product grows',
    ],
    requirements: [
      'Strong Python, with production backend experience',
      'Solid grasp of API design, databases, and async patterns',
      'You think about failure modes before they happen',
      'Comfortable owning a service end to end',
    ],
    niceToHave: [
      'LLM or agent-orchestration experience',
      'Celery, Redis, or distributed task systems',
      'Kubernetes, Docker, or infrastructure work',
    ],
    whatYoullGet: [
      'Deep work on agent infrastructure most engineers never touch',
      'Architectural ownership at a formative stage',
      'Direct exposure to production AI system design',
    ],
  },
  {
    slug: 'ai-ml-engineer',
    title: 'AI / ML Engineer',
    department: 'engineering',
    team: 'Engineering',
    location: 'Remote — global',
    type: 'Full-time',
    summary:
      'Make our agents more capable, more grounded, and more reliable than the current state of the art.',
    about: [
      'This role sits at the centre of the product: retrieval, evaluation, orchestration, and the difference between an agent that demos well and one that can be trusted with real work.',
    ],
    responsibilities: [
      'Improve agent reasoning, tool use, and multi-step orchestration',
      'Build and maintain retrieval pipelines and the evaluation harness',
      'Work on model routing, cost, and latency across providers',
      'Measure quality honestly and act on what the numbers say',
      'Keep pace with the field and bring what matters into the product',
    ],
    requirements: [
      'Hands-on experience building with LLMs beyond simple prompting',
      'Strong Python',
      'Understanding of retrieval, embeddings, and vector search',
      'Rigour about evaluation — you do not ship on vibes',
    ],
    niceToHave: [
      'Agent frameworks and orchestration experience',
      'Fine-tuning or model-training background',
      'Published research or open-source work',
    ],
    whatYoullGet: [
      'Ownership of the intelligence layer of the product',
      'Freedom to research and apply what you find',
      'Problems that are genuinely unsolved',
    ],
  },
  {
    slug: 'engineering-intern',
    title: 'Engineering Intern',
    department: 'engineering',
    team: 'Engineering',
    location: 'Remote — global',
    type: 'Internship',
    summary:
      'Ship real code to a real production AI platform, with mentorship the whole way.',
    about: [
      'For a student or early-career engineer who learns fastest by building. You will work on real features, get real code review, and see your work go live.',
    ],
    responsibilities: [
      'Build features across the frontend or backend, depending on your strengths',
      'Fix bugs and improve reliability',
      'Write tests and documentation',
      'Take part in code review and technical discussion',
    ],
    requirements: [
      'Solid fundamentals in Python or TypeScript',
      'Projects, coursework, or contributions you can walk us through',
      'Eager to learn and comfortable asking questions',
      'Reliable and self-directed in an async team',
    ],
    niceToHave: [
      'Personal projects involving AI or LLMs',
      'Open-source contributions',
    ],
    whatYoullGet: [
      'Mentorship and genuine code review from the founder',
      'Production code in your portfolio',
      'A written recommendation on successful completion',
      'A path to a larger role as the company grows',
    ],
  },

  // ── Operations & GTM ────────────────────────────────────────────────
  {
    slug: 'customer-success',
    title: 'Customer Success Lead',
    department: 'operations',
    team: 'Operations & GTM',
    location: 'Remote — global',
    type: 'Full-time',
    summary:
      'Be the reason our first customers succeed — and the channel that tells us what to build next.',
    about: [
      'Early customers need a real person who understands both their workflow and the product. You will onboard them, keep them successful, and carry what you learn straight back into the roadmap.',
    ],
    responsibilities: [
      'Onboard new customers and get them to real value quickly',
      'Own support, and turn recurring questions into documentation',
      'Track health and act before an account goes quiet',
      'Feed customer insight into product decisions',
      'Build the playbooks and help material the team will scale on',
    ],
    requirements: [
      'Experience in customer success, support, or account management',
      'Excellent written communication',
      'Technical enough to genuinely understand the product',
      'Real empathy and patience with people learning something new',
    ],
    niceToHave: [
      'You have worked at an early-stage startup',
      'SaaS or developer-tool background',
    ],
    whatYoullGet: [
      'Direct relationships with our first customers',
      'Real influence on the roadmap',
      'Ownership of the function from the ground up',
    ],
  },
  {
    slug: 'business-development',
    title: 'Business Development',
    department: 'operations',
    team: 'Operations & GTM',
    location: 'Remote — global',
    type: 'Full-time',
    summary:
      'Find the companies whose work Lumicoria changes, and start the conversation.',
    about: [
      'You will identify where the product creates obvious value, open conversations with the right people, and build the outbound motion from scratch.',
    ],
    responsibilities: [
      'Identify and research target customers and segments',
      'Run outbound and turn interest into qualified conversations',
      'Deliver demos and articulate value in the customer’s own terms',
      'Build the pipeline process and keep it honest',
      'Feed market signal back to product and marketing',
    ],
    requirements: [
      'Experience in sales, BD, or partnerships',
      'Strong written and verbal communication',
      'Comfortable with rejection and persistent without being a nuisance',
      'Able to understand and explain a technical product',
    ],
    niceToHave: [
      'You have sold B2B SaaS or AI products',
      'An existing network in our target markets',
    ],
    whatYoullGet: [
      'Ownership of the go-to-market motion from zero',
      'Direct impact on whether the company grows',
      'A seat in the strategy conversations',
    ],
  },
  {
    slug: 'operations-intern',
    title: 'Operations Intern',
    department: 'operations',
    team: 'Operations & GTM',
    location: 'Remote — global',
    type: 'Internship',
    summary:
      'See how a company actually gets built — and help keep it running.',
    about: [
      'A broad internship for someone who wants exposure to how an early-stage company operates across the board, from customer support to process to research.',
    ],
    responsibilities: [
      'Support customer onboarding and day-to-day operations',
      'Help with research, documentation, and internal process',
      'Assist across GTM and community as needed',
      'Keep internal tooling and records in order',
    ],
    requirements: [
      'Organised, reliable, and clear in writing',
      'Curious about how startups work',
      'Self-directed in an async team',
    ],
    niceToHave: [
      'Experience with modern productivity or no-code tooling',
      'Previous startup exposure',
    ],
    whatYoullGet: [
      'A view of company-building most people never get',
      'Mentorship directly from the founder',
      'A written recommendation on successful completion',
      'A path to a larger role as the company grows',
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

/** Priority roles first, then original order — used everywhere the board renders. */
export const sortRoles = (roles: Role[]): Role[] =>
  [...roles].sort((a, b) => Number(Boolean(b.priority)) - Number(Boolean(a.priority)));

export const getRole = (department: string, slug: string): Role | undefined =>
  ROLES.find((role) => role.department === department && role.slug === slug);

export const getDepartment = (id: string): Department | undefined =>
  DEPARTMENTS.find((department) => department.id === id);

/** Canonical path for a role — keep every link in the app going through this. */
export const roleHref = (role: Role): string => `/careers/${role.department}/${role.slug}`;

export const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Internship', 'Contract'];

/** Distinct locations present in the current role list, for the filter bar. */
export const LOCATIONS: string[] = Array.from(new Set(ROLES.map((role) => role.location)));

export const CAREERS_CONTACT_EMAIL = 'careers@lumicoria.ai';

/**
 * Date the current openings were published — used for the `datePosted` field
 * that Google requires on JobPosting structured data. Bump this whenever the
 * board is refreshed so listings don't look stale in search results.
 */
export const ROLES_POSTED_AT = '2026-08-15';
