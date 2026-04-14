import MobileHeader from 'layout/MainContent/MobileHeader';
import Footer from 'layout/Footer';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <MobileHeader />

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col p-4 md:p-2">
        <div className="flex-1 w-full px-4 py-2">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default MainContent;
