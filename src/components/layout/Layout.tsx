import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SettingsModal from '../settings/SettingsModal';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background w-full bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <SettingsModal />
    </div>
  );
}
