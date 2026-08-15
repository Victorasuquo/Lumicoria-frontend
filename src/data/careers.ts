/**
 * Careers content. Single source of truth for the board, the filters, each
 * role page, the application form, and the JobPosting structured data.
 *
 * Editorial rules for anything added here:
 *   1. No compensation claims. Terms are confirmed in the intro call, which
 *      is a published step of the hiring process.
 *   2. No em dashes. Use a period, a comma, or a colon.
 *   3. Plain language. No filler verbs, no hype, no launch countdowns.
 */

export type DepartmentId = 'marketing' | 'design' | 'engineering' | 'operations';

export type EmploymentType = 'Full-time' | 'Internship' | 'Contract';

export interface Department {
  id: DepartmentId;
  label: string;
  blurb: string;
  /** Monogram shown in the department tile on the board. */
  initials: string;
  /** Tile colours. Tinted surface with brand-derived text, all WCAG AA. */
  tileClass: string;
  /** Rule under the group heading, in the same family as the tile. */
  ruleClass: string;
}

export interface Role {
  slug: string;
  title: string;
  department: DepartmentId;
  team: string;
  location: string;
  type: EmploymentType;
  /** Sorts the role to the top of the board and shows a quiet "Featured" label. */
  featured?: boolean;
  /** One line, used on the board and as the page meta description. */
  summary: string;
  about: string[];
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  whatYoullGet: string[];
}

/**
 * Team colours are categorical, not decorative: each team keeps one hue drawn
 * from the Lumicoria palette (Cognitive Violet, Outcome Gold, Core indigo,
 * Signal blue) so the board is scannable by team at a glance.
 *
 * They appear in exactly two places, the department tile and the rule under
 * the group heading. Everything interactive on the page stays a single accent
 * (Lumicoria violet), so the categorical hues never compete with actions.
 */
export const DEPARTMENTS: Department[] = [
  {
    id: 'marketing',
    label: 'Marketing and Growth',
    blurb: 'Reaching the people whose work Lumicoria changes.',
    initials: 'MG',
    tileClass: 'bg-[#FDF4D6] text-[#7A5B12]',
    ruleClass: 'bg-[#E8C766]',
  },
  {
    id: 'design',
    label: 'Design',
    blurb: 'Making capable software feel calm and obvious.',
    initials: 'DE',
    tileClass: 'bg-[#EFE9FA] text-[#4B2E83]',
    ruleClass: 'bg-lumicoria-purple',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    blurb: 'Building the platform that runs agents in production.',
    initials: 'EN',
    tileClass: 'bg-[#E7E4F4] text-[#372673]',
    ruleClass: 'bg-[#372673]',
  },
  {
    id: 'operations',
    label: 'Operations and Go to market',
    blurb: 'Turning early interest into customers who stay.',
    initials: 'OP',
    tileClass: 'bg-[#E2F0FF] text-[#0B4A6F]',
    ruleClass: 'bg-lumicoria-blue',
  },
];

/** Why join. About scope, craft and growth, never compensation. */
export const BENEFITS = [
  {
    title: 'Real ownership',
    description:
      'You own a surface of the product, make the call, and ship it. There is no committee and no queue of approvals between your work and production.',
  },
  {
    title: 'Direct mentorship',
    description:
      'You work with the founder on production AI systems: architecture, evaluation, and the tradeoffs that only appear once real users depend on something.',
  },
  {
    title: 'Work that ships',
    description:
      'We are a small team, so nothing sits in a backlog for a quarter. What you build this week is usually in front of users the next.',
  },
  {
    title: 'Remote and async',
    description:
      'Work from wherever you are. We optimise for written clarity and long stretches of focus rather than meetings and status calls.',
  },
  {
    title: 'Current tooling',
    description:
      'Hands on access to the current generation of models and agent tooling as part of the daily job, not as a side experiment.',
  },
  {
    title: 'A small, high trust team',
    description:
      'Low ego, little process, high standards. Ideas are argued on merit and decisions get made in hours rather than weeks.',
  },
];

/**
 * Published hiring process. The intro call is step two on purpose: it is where
 * scope and terms are confirmed, so candidates have the full picture before
 * the later stages ask for real time.
 */
export const HIRING_PROCESS = [
  {
    step: '1',
    title: 'Apply',
    description:
      'Send us your work. A portfolio, repository, campaign, or writing sample tells us more than a polished CV.',
  },
  {
    step: '2',
    title: 'Intro call',
    description:
      'Twenty minutes on the role, what the first month looks like, your expectations and ours, and the terms of the engagement. Ask us anything.',
  },
  {
    step: '3',
    title: 'Practical exercise',
    description:
      'A short, realistic task close to the actual work. It is timeboxed and we tell you exactly what we are looking for. We never ask for free work that we would ship.',
  },
  {
    step: '4',
    title: 'Final conversation',
    description:
      'A longer session on how you think, how you would approach the first month, and how we would work together.',
  },
  {
    step: '5',
    title: 'Decision',
    description:
      'We come back to you either way, with a reason. No silence.',
  },
];

export const ROLES: Role[] = [
  // Marketing and Growth
  {
    slug: 'social-media-manager',
    title: 'Social Media Manager',
    department: 'marketing',
    team: 'Marketing and Growth',
    location: 'Remote',
    type: 'Full-time',
    featured: true,
    summary:
      'Own how Lumicoria sounds in public and turn attention into a community of people who use the product.',
    about: [
      'We have a product we believe in and very little audience. That is the problem this role exists to solve.',
      'This is not a scheduling job. You decide what Lumicoria sounds like in public, which platforms deserve our time, and what we say to earn the first thousand people who genuinely care. You get the freedom to run experiments and the responsibility for what they produce.',
    ],
    responsibilities: [
      'Own the content calendar across X, LinkedIn, Instagram and TikTok',
      'Write and ship daily: hooks, threads, short form video scripts, announcements',
      'Hold a consistent brand voice that sounds like a person rather than a press release',
      'Grow and engage a community, and bring those people into the product',
      'Track what works against reach, engagement and signups, then cut what does not',
      'Spot cultural moments quickly and turn them into relevant content',
    ],
    requirements: [
      'You have grown a social account or community from a standing start, and can show it',
      'Genuinely strong writing. You can make a technical idea land in one sentence',
      'Fluent in how X, LinkedIn, Instagram and TikTok each actually behave',
      'Comfortable shipping daily and iterating in public',
      'Self directed. You decide what to post without waiting for a brief',
    ],
    niceToHave: [
      'You have marketed a technical or AI product before',
      'You can shoot and edit short form video yourself',
      'Enough design skill in Figma or Canva to make your own assets',
      'An existing audience or community of your own',
    ],
    whatYoullGet: [
      'Full ownership of the public voice of the company',
      'A campaign in your portfolio that you ran from strategy through execution',
      'A direct line to the founder, with no approval layer between you and shipping',
      'Room to experiment and the freedom to be wrong in public',
    ],
  },
  {
    slug: 'content-community-manager',
    title: 'Content and Community Manager',
    department: 'marketing',
    team: 'Marketing and Growth',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Write the long form work that earns trust, and look after the people who show up because of it.',
    about: [
      'Social gets attention. Content is what makes people stay. You own the blog, the product explainers, and the places our early users gather.',
    ],
    responsibilities: [
      'Write long form posts, case studies and product explainers',
      'Own content strategy and SEO from keyword through to published piece',
      'Build and moderate our community spaces, and set the tone in them',
      'Turn recurring user questions into public content',
      'Work with design on visuals that make complex ideas readable',
    ],
    requirements: [
      'A portfolio of published writing you are proud of',
      'You can explain a technical concept without flattening it',
      'A working understanding of SEO and content distribution',
      'Comfortable talking to users directly, in public',
    ],
    niceToHave: [
      'Experience writing for a developer or AI audience',
      'You have moderated a community through its awkward early phase',
      'Basic video or podcast production',
    ],
    whatYoullGet: [
      'Editorial ownership. You set the standard for how we write',
      'A published body of work with your name on it',
      'Close involvement in product decisions through user feedback',
    ],
  },
  {
    slug: 'growth-marketing-intern',
    title: 'Growth Marketing Intern',
    department: 'marketing',
    team: 'Marketing and Growth',
    location: 'Remote',
    type: 'Internship',
    summary:
      'Learn growth by running it. Real experiments, real numbers, real accountability.',
    about: [
      'A hands on internship for someone early in their career who wants to learn marketing by doing it rather than watching it. You get real experiments and real accountability, with guidance throughout.',
    ],
    responsibilities: [
      'Run growth experiments across channels and report honestly on what happened',
      'Support content production and campaign work',
      'Research competitors, audiences and channels',
      'Maintain the analytics dashboards and pull the weekly numbers',
    ],
    requirements: [
      'Strong written communication',
      'Curiosity about why things work, and comfort with being wrong',
      'Self directed and reliable with deadlines in an async team',
    ],
    niceToHave: [
      'Personal projects, a newsletter, or an audience of your own',
      'Familiarity with analytics tooling',
    ],
    whatYoullGet: [
      'Mentorship directly from the founder',
      'Real experiments and real data in your portfolio',
      'A written reference on successful completion',
      'A path to a larger role as the company grows',
    ],
  },

  // Design
  {
    slug: 'user-experience-designer',
    title: 'Product Designer (UI/UX)',
    department: 'design',
    team: 'Design',
    location: 'Remote',
    type: 'Full-time',
    featured: true,
    summary:
      'Own the product experience end to end and make AI agents feel calm and trustworthy to people who are not engineers.',
    about: [
      'AI products share a hard design problem. There is enormous capability behind an interface that usually overwhelms people. Most products solve it by exposing everything and calling that power. We want the opposite.',
      'You own the product experience across the platform, from the agent builder to the workspace to onboarding, and decide how something genuinely complex becomes something a person can trust on the first try. This is a senior scope on a small team. You set the design direction, not just the screens.',
    ],
    responsibilities: [
      'Own end to end product design: research, flows, wireframes, high fidelity UI and prototypes',
      'Design the core surfaces including the agent builder, workspace, onboarding and dashboards',
      'Build and maintain the design system so the product stays coherent as it grows',
      'Turn complex agent behaviour into interfaces people understand immediately',
      'Work with engineering so that what ships matches the intent',
      'Test with real users and let the findings change your mind',
      'Raise the visual craft of the whole product, marketing site included',
    ],
    requirements: [
      'A portfolio of shipped product work rather than concepts',
      'Real strength in interaction design and information hierarchy',
      'Fluent in Figma, including components, variants and design systems',
      'You can explain why a design works in terms of the user and the business',
      'Comfortable with ambiguity and with defining the problem yourself',
    ],
    niceToHave: [
      'You have designed for AI, data heavy, or developer products',
      'You can write front end code, or at least read it fluently',
      'Motion and prototyping skills',
      'Brand and identity experience',
    ],
    whatYoullGet: [
      'Design ownership of an entire product',
      'A design system and a set of decisions that everything else builds on',
      'Direct collaboration with the founder. Your work ships rather than gets diluted',
      'A substantial case study for your portfolio',
    ],
  },
  {
    slug: 'brand-visual-designer',
    title: 'Brand and Visual Designer',
    department: 'design',
    team: 'Design',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Give Lumicoria a visual identity people recognise, and keep it consistent everywhere it appears.',
    about: [
      'We have a brand foundation. You sharpen that identity and apply it across every surface people see: the site, social, decks, and product marketing.',
    ],
    responsibilities: [
      'Evolve and apply the visual identity across all brand surfaces',
      'Design campaign assets: social graphics, site visuals and decks',
      'Create illustration and motion that explain the product',
      'Maintain brand guidelines so quality holds as more people make assets',
      'Partner with content and social on a steady flow of visual work',
    ],
    requirements: [
      'A portfolio with strong brand and visual systems work',
      'Excellent typography and layout instincts',
      'Fluent in Figma and the Adobe suite',
      'You can move quickly on campaign work without losing craft',
    ],
    niceToHave: [
      'Motion design and animation',
      '3D or generative visual work',
      'You have taken a brand through a major public moment before',
    ],
    whatYoullGet: [
      'Ownership of how the company looks',
      'A complete brand case study',
      'Creative latitude. We hire for taste and then trust it',
    ],
  },
  {
    slug: 'design-intern',
    title: 'Design Intern',
    department: 'design',
    team: 'Design',
    location: 'Remote',
    type: 'Internship',
    summary:
      'Learn product and brand design on a real product, with real users and real deadlines.',
    about: [
      'For a designer early in their career who wants their work in front of actual users rather than in a class project. You get close mentorship and genuine responsibility.',
    ],
    responsibilities: [
      'Support product and brand design across the platform',
      'Produce social and marketing assets to brief',
      'Help build and maintain the design system',
      'Take part in user research and design critique',
    ],
    requirements: [
      'A portfolio or body of work that shows potential and taste',
      'A working knowledge of Figma',
      'Open to feedback and quick to iterate',
      'Reliable and self directed in an async team',
    ],
    niceToHave: [
      'Illustration, motion, or front end skills',
      'Personal design projects you can talk about',
    ],
    whatYoullGet: [
      'Direct mentorship on product and brand design',
      'Shipped work in your portfolio with real users behind it',
      'A written reference on successful completion',
      'A path to a larger role as the company grows',
    ],
  },

  // Engineering
  {
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    department: 'engineering',
    team: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    summary: 'Build the interfaces people use to create, run and trust AI agents.',
    about: [
      'Our frontend is React, TypeScript, Tailwind and Vite. You build the surfaces where people do the work, including the agent builder, the workspace and live run views, and you care as much about how they feel as whether they function.',
    ],
    responsibilities: [
      'Build and maintain product surfaces in React and TypeScript',
      'Turn design into interfaces that are fast, accessible and precise',
      'Handle real time and streaming interfaces for live agent runs',
      'Keep the component library and frontend architecture healthy',
      'Own performance, accessibility and cross device behaviour',
    ],
    requirements: [
      'Strong React and TypeScript with production work to show',
      'Real CSS skill. You can build what the design actually specified',
      'A solid understanding of state management, data fetching and performance',
      'You care about the details other people skip',
    ],
    niceToHave: [
      'Experience with streaming or real time UI',
      'Design sensibility, or comfort working without pixel perfect specs',
      'Open source contributions',
    ],
    whatYoullGet: [
      'Ownership of the frontend architecture at an early stage',
      'Genuinely novel interface problems',
      'Direct collaboration with design and the founder',
    ],
  },
  {
    slug: 'backend-engineer',
    title: 'Backend Engineer',
    department: 'engineering',
    team: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    summary: 'Build the platform that runs AI agents reliably in production.',
    about: [
      'Our backend is Python and FastAPI with MongoDB, Postgres, Redis and Celery. The hard problems here are reliability, orchestration and cost. Agents that run unattended have to be dependable.',
    ],
    responsibilities: [
      'Design and build the APIs and services that power the platform',
      'Work on agent orchestration, scheduling and background execution',
      'Integrate model providers and third party systems',
      'Own reliability: retries, rate limits, failure handling and observability',
      'Model and evolve the data layer as the product grows',
    ],
    requirements: [
      'Strong Python with production backend experience',
      'A solid grasp of API design, databases and async patterns',
      'You think about failure modes before they happen',
      'Comfortable owning a service end to end',
    ],
    niceToHave: [
      'LLM or agent orchestration experience',
      'Celery, Redis, or distributed task systems',
      'Kubernetes, Docker, or infrastructure work',
    ],
    whatYoullGet: [
      'Deep work on agent infrastructure that most engineers never touch',
      'Architectural ownership at a formative stage',
      'Direct exposure to production AI system design',
    ],
  },
  {
    slug: 'ai-ml-engineer',
    title: 'AI and ML Engineer',
    department: 'engineering',
    team: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Make our agents more capable, more grounded and more reliable than the current state of the art.',
    about: [
      'This role sits at the centre of the product: retrieval, evaluation, orchestration, and the difference between an agent that demos well and one that can be trusted with real work.',
    ],
    responsibilities: [
      'Improve agent reasoning, tool use and multi step orchestration',
      'Build and maintain retrieval pipelines and the evaluation harness',
      'Work on model routing, cost and latency across providers',
      'Measure quality honestly and act on what the numbers say',
      'Keep pace with the field and bring what matters into the product',
    ],
    requirements: [
      'Hands on experience building with LLMs beyond simple prompting',
      'Strong Python',
      'An understanding of retrieval, embeddings and vector search',
      'Rigour about evaluation. You do not ship on vibes',
    ],
    niceToHave: [
      'Agent frameworks and orchestration experience',
      'Fine tuning or model training background',
      'Published research or open source work',
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
    location: 'Remote',
    type: 'Internship',
    summary: 'Ship real code to a production AI platform, with mentorship throughout.',
    about: [
      'For a student or early career engineer who learns fastest by building. You work on real features, get real code review, and see your work go live.',
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
      'Reliable and self directed in an async team',
    ],
    niceToHave: ['Personal projects involving AI or LLMs', 'Open source contributions'],
    whatYoullGet: [
      'Mentorship and genuine code review from the founder',
      'Production code in your portfolio',
      'A written reference on successful completion',
      'A path to a larger role as the company grows',
    ],
  },

  // Operations and Go to market
  {
    slug: 'customer-success',
    title: 'Customer Success Lead',
    department: 'operations',
    team: 'Operations and Go to market',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Be the reason our first customers succeed, and the channel that tells us what to build next.',
    about: [
      'Early customers need a real person who understands both their workflow and the product. You onboard them, keep them successful, and carry what you learn back into the roadmap.',
    ],
    responsibilities: [
      'Onboard new customers and get them to real value quickly',
      'Own support, and turn recurring questions into documentation',
      'Track account health and act before an account goes quiet',
      'Feed customer insight into product decisions',
      'Build the playbooks and help material the team will scale on',
    ],
    requirements: [
      'Experience in customer success, support, or account management',
      'Excellent written communication',
      'Technical enough to genuinely understand the product',
      'Real patience with people learning something new',
    ],
    niceToHave: [
      'You have worked at an early stage startup',
      'A SaaS or developer tool background',
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
    team: 'Operations and Go to market',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Find the companies whose work Lumicoria changes, and start the conversation.',
    about: [
      'You identify where the product creates obvious value, open conversations with the right people, and build the outbound motion from scratch.',
    ],
    responsibilities: [
      'Identify and research target customers and segments',
      'Run outbound and turn interest into qualified conversations',
      'Deliver demos and articulate value in the customer own terms',
      'Build the pipeline process and keep it honest',
      'Feed market signal back to product and marketing',
    ],
    requirements: [
      'Experience in sales, business development, or partnerships',
      'Strong written and verbal communication',
      'Comfortable with rejection, and persistent without being a nuisance',
      'Able to understand and explain a technical product',
    ],
    niceToHave: [
      'You have sold B2B SaaS or AI products',
      'An existing network in our target markets',
    ],
    whatYoullGet: [
      'Ownership of the go to market motion from zero',
      'Direct impact on whether the company grows',
      'A seat in the strategy conversations',
    ],
  },
  {
    slug: 'operations-intern',
    title: 'Operations Intern',
    department: 'operations',
    team: 'Operations and Go to market',
    location: 'Remote',
    type: 'Internship',
    summary: 'See how a company actually gets built, and help keep it running.',
    about: [
      'A broad internship for someone who wants exposure to how an early stage company operates, from customer support through process and research.',
    ],
    responsibilities: [
      'Support customer onboarding and day to day operations',
      'Help with research, documentation and internal process',
      'Assist across go to market and community as needed',
      'Keep internal tooling and records in order',
    ],
    requirements: [
      'Organised, reliable, and clear in writing',
      'Curious about how startups work',
      'Self directed in an async team',
    ],
    niceToHave: [
      'Experience with modern productivity or no code tooling',
      'Previous startup exposure',
    ],
    whatYoullGet: [
      'A view of company building that most people never get',
      'Mentorship directly from the founder',
      'A written reference on successful completion',
      'A path to a larger role as the company grows',
    ],
  },
];

// Helpers

/** Featured roles first, original order otherwise. */
export const sortRoles = (roles: Role[]): Role[] =>
  [...roles].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

export const getRole = (department: string, slug: string): Role | undefined =>
  ROLES.find((role) => role.department === department && role.slug === slug);

export const getDepartment = (id: string): Department | undefined =>
  DEPARTMENTS.find((department) => department.id === id);

/** Canonical path for a role. Every link should go through this. */
export const roleHref = (role: Role): string => `/careers/${role.department}/${role.slug}`;

export const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Internship', 'Contract'];

export const CAREERS_CONTACT_EMAIL = 'careers@lumicoria.ai';

/**
 * Date the current openings were published, for the `datePosted` field that
 * Google requires on JobPosting structured data. Bump it when the board is
 * refreshed so listings do not look stale in search results.
 */
export const ROLES_POSTED_AT = '2026-08-15';
