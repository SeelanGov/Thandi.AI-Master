// useAssessment hook for assessment data management
// Provides auto-save, progress restoration, and error handling with React Query

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { 
  CreateAssessmentDataSchema, 
  UpdateAssessmentDataSchema,
  AssessmentFormDataSchema 
} from '../validation/schemas';
import type { 
  AssessmentData, 
  CreateAssessmentData, 
  UpdateAssessmentData,
  AssessmentFormData,
  ApiResponse,
  ValidationError,
  Grade 
} from '../types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface UseAssessmentOptions {
  studentId: string;
  autoSaveDelay?: number; // Debounce delay in milliseconds
  enableOfflineQueue?: boolean;
  onSaveSuccess?: (data: AssessmentData) => void;
  onSaveError?: (error: Error) => void;
  onLoadError?: (error: Error) => void;
}

export interface AssessmentState {
  data: Partial<AssessmentFormData>;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  errors: ValidationError[];
  isOffline: boolean;
}

export interface UseAssessmentReturn {
  // State
  assessment: AssessmentData | null;
  formData: Partial<AssessmentFormData>;
  state: AssessmentState;
  
  // Actions
  updateField: (field: keyof AssessmentFormData, value: any) => void;
  updateSubject: (subject: string, mark: number) => void;
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  updateConstraints: (constraints: Partial<AssessmentFormData['constraints']>) => void;
  
  // Operations
  saveAssessment: () => Promise<void>;
  submitAssessment: () => Promise<void>;
  resetForm: () => void;
  validateForm: () => boolean;
  
  // Utilities
  getProgress: () => number;
  canSubmit: () => boolean;
  hasUnsavedChanges: () => boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const saveAssessmentData = async (data: CreateAssessmentData | UpdateAssessmentData): Promise<AssessmentData> => {
  const isUpdate = 'id' in data;
  const endpoint = '/api/assessment/save';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const result: ApiResponse<AssessmentData> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to save assessment');
  }

  return result.data;
};

const loadAssessmentData = async (studentId: string): Promise<AssessmentData | null> => {
  const response = await fetch(`/api/assessment/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    return null; // No assessment found
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const result: ApiResponse<AssessmentData> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to load assessment');
  }

  return result.data || null;
};

const submitAssessmentData = async (studentId: string): Promise<AssessmentData> => {
  const response = await fetch('/api/assessment/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ student_id: studentId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const result: ApiResponse<AssessmentData> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to submit assessment');
  }

  return result.data;
};

// ============================================================================
// OFFLINE QUEUE MANAGEMENT (SUPABASE-BASED)
// ============================================================================

interface OfflineOperation {
  id: string;
  type: 'save' | 'submit';
  data: any;
  timestamp: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const addToOfflineQueue = async (studentId: string, operation: Omit<OfflineOperation, 'id' | 'timestamp'>) => {
  if (typeof window === 'undefined') return;
  
  const queue = await getOfflineQueue(studentId);
  const newOperation: OfflineOperation = {
    ...operation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  
  queue.push(newOperation);
  
  try {
    await supabase
      .from('assessment_drafts')
      .upsert({
        student_id: studentId,
        draft_data: queue
      });
  } catch (error) {
    console.error('Failed to save offline queue to Supabase:', error);
    // Fallback to localStorage if Supabase fails
    localStorage.setItem(`assessment_offline_queue_${studentId}`, JSON.stringify(queue));
  }
};

const getOfflineQueue = async (studentId: string): Promise<OfflineOperation[]> => {
  if (typeof window === 'undefined') return [];
  
  try {
    const { data, error } = await supabase
      .from('assessment_drafts')
      .select('draft_data')
      .eq('student_id', studentId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }
    
    return data?.draft_data || [];
  } catch (error) {
    console.error('Failed to get offline queue from Supabase:', error);
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(`assessment_offline_queue_${studentId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
};

const clearOfflineQueue = async (studentId: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    await supabase
      .from('assessment_drafts')
      .delete()
      .eq('student_id', studentId);
  } catch (error) {
    console.error('Failed to clear offline queue from Supabase:', error);
    // Fallback to localStorage cleanup
    localStorage.removeItem(`assessment_offline_queue_${studentId}`);
  }
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useAssessment = (options: UseAssessmentOptions): UseAssessmentReturn => {
  const {
    studentId,
    autoSaveDelay = 2000,
    enableOfflineQueue = true,
    onSaveSuccess,
    onSaveError,
    onLoadError,
  } = options;

  const queryClient = useQueryClient();
  
  // Local state
  const [formData, setFormData] = useState<Partial<AssessmentFormData>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Query for loading assessment data
  const {
    data: assessment,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ['assessment', studentId],
    queryFn: () => loadAssessmentData(studentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (no assessment found)
      if (error.message.includes('404')) return false;
      return failureCount < 3;
    },

  });

  // Mutation for saving assessment data
  const saveMutation = useMutation({
    mutationFn: saveAssessmentData,
    onSuccess: (data) => {
      setLastSaved(new Date());
      setIsDirty(false);
      setErrors([]);
      
      // Update the query cache
      queryClient.setQueryData(['assessment', studentId], data);
      
      onSaveSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error('Failed to save assessment:', error);
      
      // Add to offline queue if enabled and it's a network error
      if (enableOfflineQueue && (error.message.includes('Network') || error.message.includes('fetch'))) {
        addToOfflineQueue(studentId, {
          type: 'save',
          data: formData,
        });
        setIsOffline(true);
      }
      
      onSaveError?.(error);
    },
  });

  // Mutation for submitting assessment
  const submitMutation = useMutation({
    mutationFn: () => submitAssessmentData(studentId),
    onSuccess: (data) => {
      queryClient.setQueryData(['assessment', studentId], data);
      setIsDirty(false);
      clearOfflineQueue(studentId);
    },
    onError: (error: Error) => {
      console.error('Failed to submit assessment:', error);
      
      if (enableOfflineQueue && (error.message.includes('Network') || error.message.includes('fetch'))) {
        addToOfflineQueue(studentId, {
          type: 'submit',
          data: { student_id: studentId },
        });
        setIsOffline(true);
      }
    },
  });

  // Initialize form data from loaded assessment
  useEffect(() => {
    if (assessment && Object.keys(formData).length === 0) {
      const assessmentData = assessment as AssessmentData;
      setFormData({
        grade: assessmentData.grade as Grade,
        subjects: assessmentData.subjects,
        interests: assessmentData.interests,
        constraints: assessmentData.constraints,
      });
    }
  }, [assessment, formData]);

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (isDirty && Object.keys(formData).length > 0) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const timeout = setTimeout(() => {
        saveAssessment();
      }, autoSaveDelay);

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [isDirty, formData, autoSaveDelay]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      
      // Process offline queue when back online
      if (enableOfflineQueue) {
        const queue = await getOfflineQueue(studentId);
        if (queue.length > 0) {
          // Process the most recent operation
          const latestOperation = queue[queue.length - 1];
          if (latestOperation.type === 'save') {
            saveMutation.mutate(latestOperation.data);
          } else if (latestOperation.type === 'submit') {
            submitMutation.mutate();
          }
          await clearOfflineQueue(studentId);
        }
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineQueue, saveMutation, submitMutation]);

  // ============================================================================
  // FORM ACTIONS
  // ============================================================================

  const updateField = useCallback((field: keyof AssessmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  }, []);

  const updateSubject = useCallback((subject: string, mark: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subject]: mark,
      },
    }));
    setIsDirty(true);
  }, []);

  const addInterest = useCallback((interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: [...(prev.interests || []), interest],
    }));
    setIsDirty(true);
  }, []);

  const removeInterest = useCallback((interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: (prev.interests || []).filter(i => i !== interest),
    }));
    setIsDirty(true);
  }, []);

  const updateConstraints = useCallback((constraints: Partial<AssessmentFormData['constraints']>) => {
    setFormData(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        ...constraints,
      },
    }));
    setIsDirty(true);
  }, []);

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  const saveAssessment = useCallback(async () => {
    try {
      // Validate form data
      const validationResult = AssessmentFormDataSchema.safeParse(formData);
      if (!validationResult.success) {
        const validationErrors: ValidationError[] = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        setErrors(validationErrors);
        return;
      }

      // Prepare data for API
      const assessmentData = assessment as AssessmentData;
      const dataToSave = assessmentData 
        ? { ...formData, id: assessmentData.id } as UpdateAssessmentData
        : { ...formData, student_id: studentId } as CreateAssessmentData;

      await saveMutation.mutateAsync(dataToSave);
    } catch (error) {
      console.error('Save assessment error:', error);
      throw error;
    }
  }, [formData, assessment, studentId, saveMutation]);

  const submitAssessment = useCallback(async () => {
    // Ensure data is saved first
    if (isDirty) {
      await saveAssessment();
    }

    await submitMutation.mutateAsync();
  }, [isDirty, saveAssessment, submitMutation]);

  const resetForm = useCallback(() => {
    setFormData({});
    setIsDirty(false);
    setErrors([]);
    setLastSaved(null);
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationResult = AssessmentFormDataSchema.safeParse(formData);
    
    if (!validationResult.success) {
      const validationErrors: ValidationError[] = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      setErrors(validationErrors);
      return false;
    }

    setErrors([]);
    return true;
  }, [formData]);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const getProgress = useCallback((): number => {
    const requiredFields = ['grade', 'subjects', 'interests', 'constraints'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof AssessmentFormData];
      if (field === 'subjects') {
        return value && Object.keys(value).length >= 4;
      }
      if (field === 'interests') {
        return value && Array.isArray(value) && value.length > 0;
      }
      return value !== undefined && value !== null;
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  const canSubmit = useCallback((): boolean => {
    return getProgress() === 100 && !saveMutation.isPending && !submitMutation.isPending;
  }, [getProgress, saveMutation.isPending, submitMutation.isPending]);

  const hasUnsavedChanges = useCallback((): boolean => {
    return isDirty && !saveMutation.isPending;
  }, [isDirty, saveMutation.isPending]);

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  const state: AssessmentState = {
    data: formData,
    isDirty,
    isSaving: saveMutation.isPending,
    isLoading,
    lastSaved,
    errors,
    isOffline,
  };

  return {
    // State
    assessment: assessment as AssessmentData | null,
    formData,
    state,
    
    // Actions
    updateField,
    updateSubject,
    addInterest,
    removeInterest,
    updateConstraints,
    
    // Operations
    saveAssessment,
    submitAssessment,
    resetForm,
    validateForm,
    
    // Utilities
    getProgress,
    canSubmit,
    hasUnsavedChanges,
  };
};

export default useAssessment;