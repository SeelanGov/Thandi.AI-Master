import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
  title: 'Thandi Admin Dashboard',
  description: 'Admin dashboard for monitoring and managing Thandi system',
};

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
