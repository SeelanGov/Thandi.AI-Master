import { SchoolHeader } from './SchoolHeader';
import { SchoolNav } from './SchoolNav';

export const DashboardLayout = ({ children, schoolId }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SchoolHeader schoolId={schoolId} />
      <div className="flex">
        <SchoolNav schoolId={schoolId} />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};