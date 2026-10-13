import type { QuizBankFile } from '../../types/quiz';

/**
 * The quiz banks in `quiz-banks/`, one lazy loader per file. Which modules have a quiz is read
 * from these files and from nowhere else: the navigation, the sidebar, the pages and the
 * milestones all ask here, so adding a bank file is all it takes for a module to gain its quiz.
 */
export const quizBankLoaders = import.meta.glob<QuizBankFile>('/quiz-banks/*.quiz.json', {
  import: 'default',
});

export const quizBankPath = (moduleId: string): string => `/quiz-banks/${moduleId}.quiz.json`;

/** Whether `quiz-banks/<moduleId>.quiz.json` exists. Not every module has one. */
export const hasQuizBank = (moduleId: string): boolean => quizBankPath(moduleId) in quizBankLoaders;
