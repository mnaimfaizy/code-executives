import React from 'react';
import { useLocation } from 'react-router-dom';
// Import Big-O sections as they are created
import Introduction from './components/sections/Introduction';
import AdvancedConcepts from './components/sections/AdvancedConcepts';
import CodingChallenges from './components/sections/CodingChallenges';
import GamificationHub from './components/sections/GamificationHub';
import CoreConcepts from './components/sections/CoreConcepts';
import CommonComplexities from './components/sections/CommonComplexities';
import AlgorithmAnalysis from './components/sections/AlgorithmAnalysis';
import RealWorldApplications from './components/sections/RealWorldApplications';
import AdvancedTopics from './components/sections/AdvancedTopics';
import Playground from '../../components/playground/Playground';
// import AlgorithmAnalysis from './components/sections/AlgorithmAnalysis';
// import RealWorldApplications from './components/sections/RealWorldApplications';
// import PracticeChallenges from './components/sections/PracticeChallenges';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

/**
 * Big-O Notation Main Page
 * Interactive learning platform for understanding algorithmic complexity
 */
const BigOPage: React.FC = () => {
  const query = useQuery();
  const rawSection = query.get('section') || 'introduction';
  // Normalize section name to handle URL encoding and different formats
  const section = rawSection.toLowerCase().replace(/\s+/g, '-');

  const renderSection = () => {
    switch (section) {
      case 'introduction':
        return <Introduction />;
      case 'advanced-concepts':
        return <AdvancedConcepts />;
      case 'core-concepts':
        return <CoreConcepts />;
      case 'common-complexities':
        return <CommonComplexities />;
      case 'algorithm-analysis':
        return <AlgorithmAnalysis />;
      case 'real-world-applications':
        return <RealWorldApplications />;
      case 'advanced-topics':
        return <AdvancedTopics />;
      case 'practice-challenges':
        return <CodingChallenges />;
      case 'gamification-hub':
        return <GamificationHub />;
      case 'playground':
        return <Playground />;
      default:
        return <Introduction />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderSection()}</div>
    </div>
  );
};

// Temporary placeholder components until full sections are implemented

export default BigOPage;
