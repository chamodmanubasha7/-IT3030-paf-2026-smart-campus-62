import { Outlet } from 'react-router-dom';
import { MainLayout } from './MainLayout';

export default function TicketsLayout() {
  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        <Outlet />
      </div>
    </MainLayout>
  );
}
