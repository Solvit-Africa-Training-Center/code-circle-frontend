export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export type CourseLesson = {
  id: string;
  title: string;
  description?: string;
  type: string;
  orderIndex: number;
  duration: number;
  isPublished: boolean;
  isMandatory: boolean;
  moduleId: string;
  contents?: LessonContent[];
};

export type LessonContentType =
  | 'video'
  | 'text'
  | 'code_exercise'
  | 'external_link'
  | 'file';

export type LessonContent = {
  id?: string;
  type: LessonContentType;
  orderIndex: number;
  url?: string;
  content?: string;
  linkTitle?: string;
  linkUrl?: string;
  exerciseInstructions?: string;
  codeLanguage?: string;
  starterCode?: string;
  solutionCode?: string;
  metadata?: Record<string, unknown>;
};

export type LessonType =
  | 'video'
  | 'text'
  | 'code_exercise'
  | 'external_link'
  | 'quiz'
  | 'assignment';

export type CourseModule = {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  duration: number;
  isPublished: boolean;
  courseId: string;
  lessons?: CourseLesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: CourseLevel;
  status: CourseStatus;
  duration: number;
  clubId: string;
  createdBy: string;
  modules?: CourseModule[];
  createdAt: string;
  updatedAt: string;
};

export type CreateCoursePayload = {
  title: string;
  description: string;
  level: CourseLevel;
  clubId: string;
  status?: CourseStatus;
  duration?: number;
  thumbnail?: string;
};

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export type CreateModulePayload = {
  title: string;
  description?: string;
  orderIndex: number;
  duration?: number;
  isPublished?: boolean;
};

export type UpdateModulePayload = Partial<CreateModulePayload>;

export type CreateLessonPayload = {
  title: string;
  description?: string;
  type: LessonType;
  orderIndex: number;
  duration?: number;
  isPublished?: boolean;
  isMandatory?: boolean;
  contents?: LessonContent[];
};

export type UpdateLessonPayload = Partial<CreateLessonPayload>;
