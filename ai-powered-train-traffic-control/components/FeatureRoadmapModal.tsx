import React from 'react';
import Icon from './Icon';

interface FeatureRoadmapModalProps {
  onClose: () => void;
}

const FeatureRoadmapModal: React.FC<FeatureRoadmapModalProps> = ({ onClose }) => {
  
  const FeatureCategory: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div>
      <h3 className="text-xl font-semibold text-cyan-400 mb-3">{title}</h3>
      <ul className="space-y-3 text-gray-300">
        {children}
      </ul>
    </div>
  );

  const FeatureItem: React.FC<{icon: any; title: string; children: React.ReactNode}> = ({icon, title, children}) => (
    <li className="flex items-start space-x-3">
        <Icon name={icon} className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0"/>
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-gray-400">{children}</p>
        </div>
    </li>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Icon name="roadmap" className="w-8 h-8 text-cyan-400"/>
            <h2 className="text-2xl font-bold text-white">Project Roadmap: Pan-India Vision</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <Icon name="close" className="w-8 h-8" />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8">
          <p className="text-gray-300 text-lg text-center max-w-4xl mx-auto">
            To scale the AI Train Control System for a pan-India implementation, the following user-centric and technologically advanced features are proposed. The goal is to create a unified, collaborative, and deeply insightful platform for the entire railway ecosystem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCategory title="Platform & Scalability">
              <FeatureItem icon="system" title="Hierarchical Control View">Dashboards for Section, Division, Zone, and National levels with seamless drill-down capabilities.</FeatureItem>
              <FeatureItem icon="user" title="Integrated Communication Hub">Secure, real-time chat and voice for controllers to coordinate train handoffs between sections.</FeatureItem>
              <FeatureItem icon="utilization" title="Role-Based Access Control">Granular permissions for different user roles (Controller, Supervisor, Maintenance, Management).</FeatureItem>
            </FeatureCategory>

            <FeatureCategory title="Advanced Analytics & AI">
                <FeatureItem icon="scenario" title="Predictive 'What-If' Scenarios">A sandbox mode within the Digital Twin for controllers to simulate the impact of their decisions before applying them.</FeatureItem>
                <FeatureItem icon="train" title="Passenger Impact Module">Real-time analytics on how delays affect passengers, calculating missed connections and total passenger-hours lost.</FeatureItem>
                <FeatureItem icon="alert" title="Predictive Maintenance Alerts">AI algorithms to analyze infrastructure data (signals, tracks) and flag potential equipment failures before they occur.</FeatureItem>
            </FeatureCategory>

            <FeatureCategory title="Enhanced User Experience">
                <FeatureItem icon="info" title="Multilingual Support">Full localization of the UI and alerts into various regional Indian languages to improve usability across the country.</FeatureItem>
                <FeatureItem icon="system" title="Mobile Companion App">A lightweight, secure app for on-ground staff to receive critical alerts and view network status on the go.</FeatureItem>
                <FeatureItem icon="punctuality" title="Automated Reporting Suite">One-click generation of end-of-shift summaries, punctuality reports, and incident analyses, reducing manual paperwork.</FeatureItem>
            </FeatureCategory>
          </div>
        </div>

        <div className="p-6 bg-gray-900 border-t border-gray-700 text-right rounded-b-lg flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureRoadmapModal;