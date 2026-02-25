export type StoredCourseProgress = {
  completedLessons?: string[];
  completedAssignmentIds?: string[];
  completedProjectIds?: string[];
  requiredAssignments?: number;
  requiredProjects?: number;
  isCompleted?: boolean;
};

export type CourseProgressMetrics = {
  percent: number;
  isCompleted: boolean;
  completedUnits: number;
  totalUnits: number;
};

export const computeCourseProgress = (params: {
  lessonTotal: number;
  completedLessons: number;
  requiredAssignments?: number;
  completedAssignments?: number;
  requiredProjects?: number;
  completedProjects?: number;
}): CourseProgressMetrics => {
  const lessonTotal = Math.max(0, params.lessonTotal);
  const completedLessons = Math.min(Math.max(0, params.completedLessons), lessonTotal);
  const requiredAssignments = Math.max(0, params.requiredAssignments ?? 0);
  const completedAssignments = Math.min(
    Math.max(0, params.completedAssignments ?? 0),
    requiredAssignments,
  );
  const requiredProjects = Math.max(0, params.requiredProjects ?? 0);
  const completedProjects = Math.min(
    Math.max(0, params.completedProjects ?? 0),
    requiredProjects,
  );

  const totalUnits = lessonTotal + requiredAssignments + requiredProjects;
  const completedUnits = completedLessons + completedAssignments + completedProjects;
  const percent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
  const isCompleted = totalUnits > 0 && completedUnits >= totalUnits;

  return { percent, isCompleted, completedUnits, totalUnits };
};
