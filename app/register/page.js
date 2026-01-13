import BulletproofStudentRegistration from '../../components/BulletproofStudentRegistration';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Student Registration</h1>
        <BulletproofStudentRegistration />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Student Registration - Thandi.AI',
  description: 'Register as a student and connect with your school'
};