import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectSubmissionState {
  step: number;
  title: string;
  category: string;
  description: string;
  budgetRange: string;
  deadline: string;
  hasExistingMaterials: boolean;
  contactEmail: string;
  setStep: (step: number) => void;
  setField: <K extends keyof ProjectSubmissionState>(key: K, value: ProjectSubmissionState[K]) => void;
  reset: () => void;
}

const initialState = {
  step: 0,
  title: '',
  category: '',
  description: '',
  budgetRange: '',
  deadline: '',
  hasExistingMaterials: false,
  contactEmail: '',
};

/**
 * Persisted to localStorage so a client who closes the tab mid-submission
 * doesn't lose their work — this is the "Autosave" requirement for the
 * multi-step Project Submission Form (Sprint 3, Deliverable 47).
 */
export const useProjectSubmissionStore = create<ProjectSubmissionState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setField: (key, value) => set({ [key]: value } as Partial<ProjectSubmissionState>),
      reset: () => set(initialState),
    }),
    { name: 'tasork-project-submission-draft' },
  ),
);
