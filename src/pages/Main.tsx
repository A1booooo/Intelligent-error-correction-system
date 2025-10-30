import MainLayout from '@/components/layout/MainLayout';
import Sidebar from '@/components/layout/Sidebar';

export default function Main() {
  return (
    <>
      <Sidebar>
        <MainLayout />
      </Sidebar>
    </>
  );
}
