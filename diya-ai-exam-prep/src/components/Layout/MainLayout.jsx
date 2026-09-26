import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-violet-50">
      <Sidebar />
      {/* Main content area - offset for sidebar */}
      <main className="flex-1 ml-[220px] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
