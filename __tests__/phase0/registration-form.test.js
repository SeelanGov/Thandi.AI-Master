/**
 * Unit Tests for Phase 0 Enhanced Student Registration Form
 * 
 * Tests school selection validation and form submission with school association
 * Validates: Requirements 1.1, 1.5
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BulletproofStudentRegistration from '../../components/BulletproofStudentRegistration';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  fetch.mockClear();
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('Phase 0: Enhanced Student Registration Form', () => {

  const mockOnComplete = jest.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  test('renders privacy step initially', () => {
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Welcome to Thandi Career Assessment')).toBeInTheDocument();
    expect(screen.getByText('How we use your information:')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  test('requires consent to proceed to registration', async () => {
    const user = userEvent.setup();
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    const continueButton = screen.getByText('Continue with Registration');
    expect(continueButton).toBeDisabled();
    
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    
    expect(continueButton).not.toBeDisabled();
  });

  test('proceeds to registration step after consent', async () => {
    const user = userEvent.setup();
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByText('Thandi Student Registration')).toBeInTheDocument();
    });
  });

  test('displays enhanced school selection interface', async () => {
    const user = userEvent.setup();
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByText('Search by Name')).toBeInTheDocument();
      expect(screen.getByText('Enter School Code')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Start typing your school name...')).toBeInTheDocument();
    });
  });

  test('switches between school search modes', async () => {
    const user = userEvent.setup();
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(() => {
      const codeButton = screen.getByText('Enter School Code');
      user.click(codeButton);
    });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter your school code/)).toBeInTheDocument();
    });
  });

  test('performs school search with API call', async () => {
    const user = userEvent.setup();
    
    // Mock successful school search
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          {
            school_id: 'SCH001',
            name: 'Test High School',
            province: 'Test Province',
            type: 'SECONDARY'
          }
        ]
      })
    });
    
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText('Start typing your school name...');
      await user.type(searchInput, 'Test High');
    });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/schools/search?q=Test%20High');
    });
  });

  test('displays school search results', async () => {
    const user = userEvent.setup();
    
    // Mock successful school search
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          {
            school_id: 'SCH001',
            name: 'Test High School',
            province: 'Test Province',
            type: 'SECONDARY'
          }
        ]
      })
    });
    
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText('Start typing your school name...');
      await user.type(searchInput, 'Test High');
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test High School')).toBeInTheDocument();
      expect(screen.getByText('Test Province')).toBeInTheDocument();
    });
  });

  test('selects school from search results', async () => {
    const user = userEvent.setup();
    
    // Mock successful school search
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          {
            school_id: 'SCH001',
            name: 'Test High School',
            province: 'Test Province',
            type: 'SECONDARY'
          }
        ]
      })
    });
    
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText('Start typing your school name...');
      await user.type(searchInput, 'Test High');
    });
    
    await waitFor(async () => {
      const schoolOption = screen.getByText('Test High School');
      await user.click(schoolOption);
    });
    
    await waitFor(() => {
      expect(screen.getByText('✓ Test High School')).toBeInTheDocument();
      expect(screen.getByText('School selected')).toBeInTheDocument();
    });
  });

  test('validates school code entry', async () => {
    const user = userEvent.setup();
    
    // Mock successful school code validation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        school: {
          school_id: 'SCH001',
          name: 'Test High School',
          province: 'Test Province',
          type: 'SECONDARY'
        }
      })
    });
    
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(async () => {
      const codeButton = screen.getByText('Enter School Code');
      await user.click(codeButton);
    });
    
    await waitFor(async () => {
      const codeInput = screen.getByPlaceholderText(/Enter your school code/);
      await user.type(codeInput, 'SCH001');
    });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/schools/validate-code?code=SCH001');
    });
  });

  test('shows "request addition" option when school not found', async () => {
    const user = userEvent.setup();
    
    // Mock empty search results
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        results: []
      })
    });
    
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText('Start typing your school name...');
      await user.type(searchInput, 'Nonexistent School');
    });
    
    await waitFor(() => {
      expect(screen.getByText("Can't find your school?")).toBeInTheDocument();
      expect(screen.getByText('Request to add your school')).toBeInTheDocument();
    });
  });

  test('opens school addition request modal', async () => {
    const user = userEvent.setup();
    
    // Mock empty search results
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        results: []
      })
    });
    
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step and fill name fields
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(async () => {
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      const lastNameInput = screen.getByPlaceholderText('Enter your last name');
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
    });
    
    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText('Start typing your school name...');
      await user.type(searchInput, 'Nonexistent School');
    });
    
    await waitFor(async () => {
      const requestButton = screen.getByText('Request to add your school');
      await user.click(requestButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Request School Addition')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Nonexistent School')).toBeInTheDocument();
    });
  });

  test('validates required fields before submission', async () => {
    const user = userEvent.setup();
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(() => {
      const submitButton = screen.getByText('Start Assessment');
      expect(submitButton).toBeDisabled();
    });
  });

  test('enables submission when all fields are filled', async () => {
    const user = userEvent.setup();
    
    // Mock successful school search
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          {
            school_id: 'SCH001',
            name: 'Test High School',
            province: 'Test Province',
            type: 'SECONDARY'
          }
        ]
      })
    });
    
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    // Fill all required fields
    await waitFor(async () => {
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      const lastNameInput = screen.getByPlaceholderText('Enter your last name');
      const gradeSelect = screen.getByDisplayValue('Select your grade');
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.selectOptions(gradeSelect, '12');
    });
    
    // Search and select school
    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText('Start typing your school name...');
      await user.type(searchInput, 'Test High');
    });
    
    await waitFor(async () => {
      const schoolOption = screen.getByText('Test High School');
      await user.click(schoolOption);
    });
    
    await waitFor(() => {
      const submitButton = screen.getByText('Start Assessment');
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('displays enhanced consent information', async () => {
    const user = userEvent.setup();
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Navigate to registration step
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByText('Share your results with your school?')).toBeInTheDocument();
      expect(screen.getByText('Benefits of sharing:')).toBeInTheDocument();
      expect(screen.getByText('Your school can provide personalized career guidance')).toBeInTheDocument();
      expect(screen.getByText('You can withdraw consent at any time')).toBeInTheDocument();
    });
  });

  test('submits registration with Phase 0 enhanced data', async () => {
    const user = userEvent.setup();
    
    // Mock successful school search
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          {
            school_id: 'SCH001',
            name: 'Test High School',
            province: 'Test Province',
            type: 'SECONDARY'
          }
        ]
      })
    });
    
    // Mock successful registration
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        student_id: 'test-student-id',
        student_profile_id: 'test-profile-id',
        token: 'test-token',
        phase0_features: {
          school_association: true,
          consent_recorded: true,
          dashboard_ready: true
        }
      })
    });
    
    render(<BulletproofStudentRegistration onComplete={mockOnComplete} />);
    
    // Complete registration flow
    const consentCheckbox = screen.getByRole('checkbox');
    await user.click(consentCheckbox);
    const continueButton = screen.getByText('Continue with Registration');
    await user.click(continueButton);
    
    // Fill form
    await waitFor(async () => {
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      const lastNameInput = screen.getByPlaceholderText('Enter your last name');
      const gradeSelect = screen.getByDisplayValue('Select your grade');
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.selectOptions(gradeSelect, '12');
    });
    
    // Select school
    await waitFor(async () => {
      const searchInput = screen.getByPlaceholderText('Start typing your school name...');
      await user.type(searchInput, 'Test High');
    });
    
    await waitFor(async () => {
      const schoolOption = screen.getByText('Test High School');
      await user.click(schoolOption);
    });
    
    // Submit
    await waitFor(async () => {
      const submitButton = screen.getByText('Start Assessment');
      await user.click(submitButton);
    });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/student/register', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"student_name":"John"')
      }));
    });
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        type: 'registered',
        student_id: 'test-student-id',
        grade: '12',
        name: 'John'
      }));
    });
  });

});