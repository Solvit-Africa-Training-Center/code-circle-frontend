export type LeaderApplySelection = {
  categoryId: string;
  categoryName: string;
};

export type LeaderApplySession = {
  categoryId: string;
  categoryName: string;
  userId: string;
  email: string;
};

export type LeaderRegisterForTestPayload = {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  cv: File;
  degree?: File | null;
};

export type LeaderRegisterForTestResponse = {
  userId: string;
  email: string;
};

export type LeaderTestQuestion = {
  id: string;
  question: string;
  options: string[];
  points: number;
  orderIndex: number;
};

export type LeaderCategoryTest = {
  id: string;
  type: 'CREATOR_TEST' | 'MEMBER_TEST';
  categoryId: string;
  passingScore: number;
  isActive: boolean;
  questions: LeaderTestQuestion[];
  createdAt: string;
};

export type LeaderSubmitTestPayload = {
  userId: string;
  testId: string;
  answers: Record<string, string>;
  purpose?: 'CREATE_CLUB' | 'JOIN_CLUB';
  categoryId?: string;
  clubName?: string;
  targetClubId?: string;
};

export type LeaderTestAttempt = {
  id: string;
  attemptId?: string;
  userId: string;
  testId: string;
  score: number;
  passed: boolean;
  proctoringVideoUrl?: string;
  reviewStatus?: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote?: string;
  attemptedAt?: string;
  completedAt?: string;
};

export type LeaderApplicationReviewStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export type AdminLeaderApplication = {
  id: string;
  score: number;
  passed: boolean;
  proctoringVideoUrl?: string;
  reviewStatus: LeaderApplicationReviewStatus;
  reviewNote?: string;
  attemptedAt?: string;
  completedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    cv?: string;
    degree?: string;
  };
  test: {
    id: string;
    category?: {
      id: string;
      name: string;
    };
  };
};

export type LeaderApplicationStatusResponse = {
  reviewStatus: LeaderApplicationReviewStatus;
  reviewNote?: string;
  temporaryPassword?: string;
  email: string;
  attemptId: string;
};
