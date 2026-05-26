import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';

export default function Layout() {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <TopNavbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
