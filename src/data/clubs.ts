import img1 from '@/assets/image-7.jpg';
import img2 from '@/assets/image-6.jpg';
import img3 from '@/assets/image-8.jpg';
import img4 from '@/assets/image-9.jpg';
import img5 from '@/assets/image2.jpg';
import img6 from '@/assets/image2.jpg';

export type Club = {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  projectsCount: number;
  modulesCount: number;
  admin: {
    name: string;
    location: string;
    email: string;
    phone: string;
    twitter: string;
    linkedin: string;
  };
  tags: string[];
  stats: {
    projects: number;
    modules: number;
    joinedMembers: number;
  };
  details: {
    entryRequirement: string;
    projects: string;
    duration: string;
    modules: string;
    weeklyCommitment: string;
    learningFormat: string;
    outcome: string;
  };
  gallery: string[];
  services: string[];
  projectList: { title: string; type: string }[];
};

const baseServices = [
  'Core Training Sessions',
  'Project-Based Learning',
  'Peer Reviews',
  'Mentor Support',
  'Certificate'
];

const baseAdmin = {
  name: 'Jacob Reed',
  location: 'Egypt, Cairo',
  email: 'jacobreed@gmail.com',
  phone: '0780647340',
  twitter: 'jacobreed',
  linkedin: 'jacobreed'
};

export const clubs: Club[] = [
  {
    id: 1,
    name: 'Frontend Flow',
    category: 'Web Development',
    description: 'Focus on creating clean, interactive user interfaces using modern frameworks',
    image: img1,
    projectsCount: 4,
    modulesCount: 8,
    admin: baseAdmin,
    tags: ['HTML', 'CSS', 'JavaScript', 'React'],
    stats: { projects: 4, modules: 8, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (HTML/CSS)',
      projects: '4 Projects',
      duration: '8 Weeks',
      modules: '8 Modules',
      weeklyCommitment: '3-5 hours',
      learningFormat: 'Hands-on projects, guided exercises, peer reviews',
      outcome: 'Build responsive, accessible, and interactive user interfaces'
    },
    gallery: [img1, img2, img3, img4, img5, img6],
    services: baseServices,
    projectList: [
      { title: 'Marketing Landing Page', type: 'web development' },
      { title: 'Product UI Kit', type: 'web development' },
      { title: 'Accessibility Audit', type: 'web development' }
    ]
  },
  {
    id: 2,
    name: 'Web Wizards',
    category: 'Web Development',
    description: 'Build modern, responsive websites using cutting-edge web technologies',
    image: img2,
    projectsCount: 4,
    modulesCount: 8,
    admin: baseAdmin,
    tags: ['HTML', 'CSS', 'UX/UI', 'JavaScript'],
    stats: { projects: 4, modules: 8, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (CSS or higher)',
      projects: '4 Projects',
      duration: '8 Weeks',
      modules: '8 Modules',
      weeklyCommitment: '3-5 hours',
      learningFormat: 'Hands-on projects, guided exercises, peer reviews',
      outcome: 'Build modern, responsive websites with best practices'
    },
    gallery: [img2, img3, img4, img5, img6, img1],
    services: baseServices,
    projectList: [
      { title: 'Corporate Website Redesign', type: 'web development' },
      { title: 'E-Commerce Storefront', type: 'web development' },
      { title: 'Startup Portfolio Website', type: 'web development' }
    ]
  },
  {
    id: 3,
    name: 'FullStack Forge',
    category: 'Software Development',
    description: 'Develop complete web applications from end-to-end using modern stacks',
    image: img3,
    projectsCount: 4,
    modulesCount: 3,
    admin: baseAdmin,
    tags: ['Node.js', 'APIs', 'Databases', 'React'],
    stats: { projects: 4, modules: 3, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (JavaScript)',
      projects: '4 Projects',
      duration: '6 Weeks',
      modules: '3 Modules',
      weeklyCommitment: '4-6 hours',
      learningFormat: 'Full-stack builds, code reviews, pair programming',
      outcome: 'Ship full-stack apps with authentication and data layers'
    },
    gallery: [img3, img4, img5, img6, img1, img2],
    services: baseServices,
    projectList: [
      { title: 'Task Manager', type: 'full stack' },
      { title: 'API-Driven Dashboard', type: 'full stack' },
      { title: 'Auth + Payments Starter', type: 'full stack' }
    ]
  },
  {
    id: 4,
    name: 'CodeCraft Club',
    category: 'Software Development',
    description: 'Build strong software foundations through hands-on coding and real-world projects',
    image: img4,
    projectsCount: 4,
    modulesCount: 5,
    admin: baseAdmin,
    tags: ['OOP', 'Design Patterns', 'Testing', 'Clean Code'],
    stats: { projects: 4, modules: 5, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (Programming Basics)',
      projects: '4 Projects',
      duration: '6 Weeks',
      modules: '5 Modules',
      weeklyCommitment: '3-5 hours',
      learningFormat: 'Workshops, exercises, team critiques',
      outcome: 'Write maintainable, testable software'
    },
    gallery: [img4, img5, img6, img1, img2, img3],
    services: baseServices,
    projectList: [
      { title: 'Library Manager', type: 'software development' },
      { title: 'CLI Productivity Tool', type: 'software development' },
      { title: 'Testing Suite Setup', type: 'software development' }
    ]
  },
  {
    id: 5,
    name: 'System Builders',
    category: 'Software Development',
    description: 'Learn how to design, build, and maintain well-structured software systems',
    image: img5,
    projectsCount: 4,
    modulesCount: 7,
    admin: baseAdmin,
    tags: ['Architecture', 'Scalability', 'APIs', 'Databases'],
    stats: { projects: 4, modules: 7, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (System Design)',
      projects: '4 Projects',
      duration: '7 Weeks',
      modules: '7 Modules',
      weeklyCommitment: '4-6 hours',
      learningFormat: 'Design reviews, system diagrams, build sprints',
      outcome: 'Design scalable, reliable software systems'
    },
    gallery: [img5, img6, img1, img2, img3, img4],
    services: baseServices,
    projectList: [
      { title: 'Scalable API Platform', type: 'system design' },
      { title: 'Event-Driven Service', type: 'system design' },
      { title: 'Monitoring Dashboard', type: 'system design' }
    ]
  },
  {
    id: 6,
    name: 'Clean Code Circle',
    category: 'Software Development',
    description: 'Master best practices for writing clean, readable, maintainable, and efficient code',
    image: img6,
    projectsCount: 4,
    modulesCount: 4,
    admin: baseAdmin,
    tags: ['Refactoring', 'Testing', 'Naming', 'SOLID'],
    stats: { projects: 4, modules: 4, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (Programming Basics)',
      projects: '4 Projects',
      duration: '5 Weeks',
      modules: '4 Modules',
      weeklyCommitment: '3-4 hours',
      learningFormat: 'Refactoring labs, style reviews, code kata',
      outcome: 'Write clear, maintainable, and efficient code'
    },
    gallery: [img6, img1, img2, img3, img4, img5],
    services: baseServices,
    projectList: [
      { title: 'Legacy Code Refactor', type: 'software development' },
      { title: 'Unit Testing Starter', type: 'software development' },
      { title: 'Code Style Guide', type: 'software development' }
    ]
  },
  {
    id: 7,
    name: 'Mobile Masters',
    category: 'Mobile App Development',
    description: 'Create cross-platform mobile apps with modern development tools',
    image: img1,
    projectsCount: 4,
    modulesCount: 7,
    admin: baseAdmin,
    tags: ['Flutter', 'React Native', 'Mobile UX', 'APIs'],
    stats: { projects: 4, modules: 7, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (JavaScript)',
      projects: '4 Projects',
      duration: '7 Weeks',
      modules: '7 Modules',
      weeklyCommitment: '4-6 hours',
      learningFormat: 'Build sprints, device testing, UI reviews',
      outcome: 'Ship polished cross-platform apps'
    },
    gallery: [img1, img2, img3, img4, img5, img6],
    services: baseServices,
    projectList: [
      { title: 'Fitness Tracker', type: 'mobile app' },
      { title: 'Food Delivery UI', type: 'mobile app' },
      { title: 'Messaging Prototype', type: 'mobile app' }
    ]
  },
  {
    id: 8,
    name: 'AppLab Studio',
    category: 'Mobile App Development',
    description: 'Build real-world mobile applications from concept to deployment',
    image: img2,
    projectsCount: 4,
    modulesCount: 8,
    admin: baseAdmin,
    tags: ['Mobile UX', 'Deployment', 'Testing', 'Performance'],
    stats: { projects: 4, modules: 8, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (Mobile Basics)',
      projects: '4 Projects',
      duration: '8 Weeks',
      modules: '8 Modules',
      weeklyCommitment: '4-6 hours',
      learningFormat: 'Product planning, sprints, release practice',
      outcome: 'Deliver production-ready mobile apps'
    },
    gallery: [img2, img3, img4, img5, img6, img1],
    services: baseServices,
    projectList: [
      { title: 'Travel Planner', type: 'mobile app' },
      { title: 'Habit Builder', type: 'mobile app' },
      { title: 'Audio Notes', type: 'mobile app' }
    ]
  },
  {
    id: 9,
    name: 'Flutter Force',
    category: 'Mobile App Development',
    description: 'Develop high-performance apps using the Flutter framework',
    image: img3,
    projectsCount: 4,
    modulesCount: 5,
    admin: baseAdmin,
    tags: ['Flutter', 'Dart', 'Widgets', 'State Management'],
    stats: { projects: 4, modules: 5, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (Dart Basics)',
      projects: '4 Projects',
      duration: '6 Weeks',
      modules: '5 Modules',
      weeklyCommitment: '4-5 hours',
      learningFormat: 'Widget labs, performance tuning, demos',
      outcome: 'Build fast, beautiful Flutter apps'
    },
    gallery: [img3, img4, img5, img6, img1, img2],
    services: baseServices,
    projectList: [
      { title: 'E-Wallet UI', type: 'mobile app' },
      { title: 'Smart Home Control', type: 'mobile app' },
      { title: 'Event Tickets', type: 'mobile app' }
    ]
  },
  {
    id: 10,
    name: 'ML Innovators',
    category: 'Machine Learning',
    description: 'Explore machine learning models and solve real-world prediction problems',
    image: img4,
    projectsCount: 4,
    modulesCount: 9,
    admin: baseAdmin,
    tags: ['Python', 'Pandas', 'Models', 'Evaluation'],
    stats: { projects: 4, modules: 9, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (Python Basics)',
      projects: '4 Projects',
      duration: '9 Weeks',
      modules: '9 Modules',
      weeklyCommitment: '4-6 hours',
      learningFormat: 'Model labs, data experiments, evaluations',
      outcome: 'Build and evaluate ML models'
    },
    gallery: [img4, img5, img6, img1, img2, img3],
    services: baseServices,
    projectList: [
      { title: 'House Price Predictor', type: 'machine learning' },
      { title: 'Customer Churn Model', type: 'machine learning' },
      { title: 'Image Classifier', type: 'machine learning' }
    ]
  },
  {
    id: 11,
    name: 'Data Minds',
    category: 'Data Engineering',
    description: 'Master data analysis techniques to analyze and interpret complex datasets',
    image: img5,
    projectsCount: 4,
    modulesCount: 7,
    admin: baseAdmin,
    tags: ['ETL', 'SQL', 'Pipelines', 'Analytics'],
    stats: { projects: 4, modules: 7, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (SQL Basics)',
      projects: '4 Projects',
      duration: '7 Weeks',
      modules: '7 Modules',
      weeklyCommitment: '4-6 hours',
      learningFormat: 'Pipeline builds, queries, dashboards',
      outcome: 'Design reliable data pipelines'
    },
    gallery: [img5, img6, img1, img2, img3, img4],
    services: baseServices,
    projectList: [
      { title: 'ETL Pipeline', type: 'data engineering' },
      { title: 'Analytics Warehouse', type: 'data engineering' },
      { title: 'Data Quality Monitor', type: 'data engineering' }
    ]
  },
  {
    id: 12,
    name: 'AI Pioneers',
    category: 'Artificial Intelligence',
    description: 'Advanced systems and build AI-driven solutions for real-world challenges',
    image: img6,
    projectsCount: 4,
    modulesCount: 6,
    admin: baseAdmin,
    tags: ['AI Systems', 'NLP', 'Vision', 'Ethics'],
    stats: { projects: 4, modules: 6, joinedMembers: 0 },
    details: {
      entryRequirement: 'Pass skill test (Python)',
      projects: '4 Projects',
      duration: '6 Weeks',
      modules: '6 Modules',
      weeklyCommitment: '4-6 hours',
      learningFormat: 'AI labs, prototyping, case studies',
      outcome: 'Build AI-driven solutions'
    },
    gallery: [img6, img1, img2, img3, img4, img5],
    services: baseServices,
    projectList: [
      { title: 'Chatbot Prototype', type: 'artificial intelligence' },
      { title: 'Image Captioning', type: 'artificial intelligence' },
      { title: 'Recommendation Engine', type: 'artificial intelligence' }
    ]
  }
];

