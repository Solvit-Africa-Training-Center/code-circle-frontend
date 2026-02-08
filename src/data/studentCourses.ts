export type CourseModule = {
  id: string;
  title: string;
  lessons: string[];
};

export type StudentCourse = {
  id: string;
  title: string;
  level: string;
  instructor: string;
  image: string;
  modules: CourseModule[];
};

export const studentCourses: StudentCourse[] = [
  {
    id: 'react-advanced',
    title: 'Advanced React Patterns',
    level: 'Frontend / Advanced',
    instructor: 'Sarah UMUTONI',
    image: '/assets/c1image.jpg',
    modules: [
      {
        id: 'react-core-patterns',
        title: 'Core Patterns',
        lessons: [
          'Compound Components',
          'Render Props',
          'Controlled vs Uncontrolled',
          'Custom Hooks',
        ],
      },
      {
        id: 'react-performance',
        title: 'Performance',
        lessons: [
          'Memoization Strategies',
          'Virtualization',
          'React Profiler',
          'Suspense Patterns',
        ],
      },
    ],
  },
  {
    id: 'postgres-foundations',
    title: 'PostgreSQL Foundations',
    level: 'Backend / Advanced',
    instructor: 'Jean MUHIRE',
    image: '/assets/c2image.jpg',
    modules: [
      {
        id: 'pg-modeling',
        title: 'Data Modeling',
        lessons: [
          'Schemas and Types',
          'Normalization',
          'Indexes',
          'Constraints',
        ],
      },
      {
        id: 'pg-queries',
        title: 'Queries and Performance',
        lessons: [
          'Joins Deep Dive',
          'Explain Plans',
          'Transactions',
          'Optimization Patterns',
        ],
      },
    ],
  },
  {
    id: 'ai-creators',
    title: 'AI for Creators',
    level: 'AI / Intermediate',
    instructor: 'Nadia K.',
    image: '/assets/c3image.jpg',
    modules: [
      {
        id: 'ai-basics',
        title: 'AI Basics',
        lessons: [
          'Prompt Foundations',
          'Workflow Automation',
          'Dataset Preparation',
          'Evaluation Metrics',
        ],
      },
      {
        id: 'ai-tools',
        title: 'Creator Tooling',
        lessons: [
          'AI Content Pipelines',
          'Image Generation',
          'Video Assistants',
          'Publishing Workflows',
        ],
      },
    ],
  },
  {
    id: 'ux-interfaces',
    title: 'UX for Interfaces',
    level: 'UI/UX / Intermediate',
    instructor: 'Grace P.',
    image: '/assets/c1image.jpg',
    modules: [
      {
        id: 'ux-research',
        title: 'Research & Insights',
        lessons: [
          'User Interviews',
          'Journey Maps',
          'Persona Building',
          'Usability Testing',
        ],
      },
      {
        id: 'ux-design',
        title: 'Interaction Design',
        lessons: [
          'Information Architecture',
          'Micro-interactions',
          'Prototype Reviews',
          'Handoff Kits',
        ],
      },
    ],
  },
  {
    id: 'node-api-lab',
    title: 'Node.js API Lab',
    level: 'Backend / Intermediate',
    instructor: 'Samir L.',
    image: '/assets/c2image.jpg',
    modules: [
      {
        id: 'node-basics',
        title: 'API Foundations',
        lessons: [
          'Routing and Controllers',
          'Middleware',
          'Validation',
          'Testing APIs',
        ],
      },
      {
        id: 'node-deploy',
        title: 'Deployment',
        lessons: [
          'Environment Config',
          'Logging and Monitoring',
          'CI/CD Basics',
          'Security Checklist',
        ],
      },
    ],
  },
  {
    id: 'clean-code-habits',
    title: 'Clean Code Habits',
    level: 'Software / Beginner',
    instructor: 'Diego M.',
    image: '/assets/c3image.jpg',
    modules: [
      {
        id: 'clean-principles',
        title: 'Core Principles',
        lessons: [
          'Naming Matters',
          'Functions and Scope',
          'Comments that Help',
          'Refactoring Basics',
        ],
      },
      {
        id: 'clean-systems',
        title: 'Clean Systems',
        lessons: [
          'Design for Change',
          'Testing Discipline',
          'Code Reviews',
          'Maintaining Quality',
        ],
      },
    ],
  },
];
