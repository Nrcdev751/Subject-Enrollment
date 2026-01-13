import React, { useState } from 'react';
import { Screen, UserProfile, CapturedImage } from './types';
import { EnrollmentScreen } from './screens/EnrollmentScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { GuessScreen } from './screens/GuessScreen';
import { GlobalBrainScreen } from './screens/GlobalBrainScreen';
import { ScanFace, Database, Lock, Network } from 'lucide-react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.ENROLLMENT);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleEnrollmentComplete = (name: string, images: CapturedImage[]) => {
    setUserProfile({
      name,
      images,
      isTrained: false,
    });
    setCurrentScreen(Screen.TRAINING);
  };

  const handleTrainingComplete = () => {
    if (userProfile) {
      setUserProfile({ ...userProfile, isTrained: true });
      setCurrentScreen(Screen.GUESS);
    }
  };

  const NavItem = ({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick?: () => void }) => (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${active ? 'text-sci-neon' : 'text-gray-600'}`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-mono uppercase">{label}</span>
      {active && <div className="w-1 h-1 bg-sci-neon rounded-full mt-1 animate-pulse" />}
    </div>
  );

  return (
    <div className="h-screen w-screen bg-sci-base flex flex-col font-sans text-gray-200 overflow-hidden">
      
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {currentScreen === Screen.ENROLLMENT && (
          <EnrollmentScreen onComplete={handleEnrollmentComplete} />
        )}
        {currentScreen === Screen.TRAINING && (
          <TrainingScreen onComplete={handleTrainingComplete} />
        )}
        {currentScreen === Screen.GUESS && (
          <GuessScreen 
            user={userProfile} 
            onBack={() => setCurrentScreen(Screen.ENROLLMENT)} 
          />
        )}
        {currentScreen === Screen.GLOBAL_BRAIN && (
          <GlobalBrainScreen />
        )}
      </main>

      {/* Bottom Navigation */}
      {(currentScreen !== Screen.GUESS) && (
        <nav className="h-20 border-t border-sci-panel bg-black/90 backdrop-blur-md flex items-center justify-around pb-4 pt-2 z-50">
          <NavItem 
            active={currentScreen === Screen.ENROLLMENT} 
            icon={ScanFace} 
            label="Enroll" 
            onClick={() => setCurrentScreen(Screen.ENROLLMENT)}
          />
          <div className="h-8 w-px bg-gray-800"></div>
          <NavItem 
            active={currentScreen === Screen.TRAINING} 
            icon={Database} 
            label="Train" 
            onClick={() => setCurrentScreen(Screen.TRAINING)}
          />
          <div className="h-8 w-px bg-gray-800"></div>
          <NavItem 
            active={currentScreen === Screen.GLOBAL_BRAIN} 
            icon={Network} 
            label="Brain" 
            onClick={() => setCurrentScreen(Screen.GLOBAL_BRAIN)}
          />
          <div className="h-8 w-px bg-gray-800"></div>
          <NavItem 
            active={false} 
            icon={Lock} 
            label="Infer" 
            onClick={() => setCurrentScreen(Screen.GUESS)}
          />
        </nav>
      )}
    </div>
  );
};

export default App;