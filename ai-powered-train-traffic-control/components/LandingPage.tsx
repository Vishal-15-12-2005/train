import React from 'react';
import Icon from './Icon';

interface LandingPageProps {
  onLaunch: () => void;
}

const FeatureCard: React.FC<{ icon: any, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 transition-all hover:border-cyan-500/50 hover:bg-gray-800">
    <div className="flex items-center space-x-4 mb-3">
      <Icon name={icon} className="w-8 h-8 text-cyan-400" />
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-gray-400">{children}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="bg-gray-900 text-white">
      <main className="container mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
            AI-Powered Precise Train Traffic Control
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
            An intelligent Decision Support System designed to maximize railway throughput, enhance punctuality, and ensure safety through real-time, AI-driven optimization.
          </p>
          <button
            onClick={onLaunch}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105"
          >
            Launch Controller Portal
          </button>
        </section>

        {/* The Problem Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-2">The Challenge of Real-Time Railway Traffic Management</h2>
          <p className="text-center text-gray-400 mb-10">The core issue is the Real-time Railway Traffic Management Problem (rtRTMP), a dynamic and complex optimization task.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-red-400">Combinatorial Complexity</h3>
                <p className="text-gray-400 text-sm">An exponential number of possible train routing decisions makes finding the optimal sequence manually impossible in real-time.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-yellow-400">Dynamic Disruptions</h3>
                <p className="text-gray-400 text-sm">Pre-planned timetables are constantly affected by unforeseen events, causing cascading "knock-on" delays across the network.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-purple-400">Conflicting Objectives</h3>
                <p className="text-gray-400 text-sm">Controllers must constantly balance throughput, punctuality, train priorities, and passenger satisfaction—goals that often conflict.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-orange-400">Deadlock Risk</h3>
                <p className="text-gray-400 text-sm">Suboptimal routing in congested areas can lead to gridlock, paralyzing a section of the network and causing massive delays.</p>
            </div>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">Our Solution: An Intelligent Decision Support System</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-300 mb-6">
                Our system assists, rather than replaces, human controllers. It leverages a state-of-the-art Deep Reinforcement Learning (DRL) agent trained in a high-fidelity 'Digital Twin' simulation of the railway network. Through millions of simulated scenarios, the AI learns optimal strategies to resolve conflicts and manage disruptions with near-instantaneous, data-driven recommendations.
              </p>
              <div className="space-y-4">
                  <FeatureCard icon="ai" title="Deep Reinforcement Learning Core">
                    The AI agent learns optimal control policies through trial-and-error in a safe, simulated environment, mastering complex traffic patterns.
                  </FeatureCard>
                  <FeatureCard icon="system" title="High-Fidelity Digital Twin">
                    A perfect virtual replica of the railway network serves as the training ground for the AI and a 'what-if' analysis tool for controllers.
                  </FeatureCard>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="https://storage.googleapis.com/aistudio-hosting/generative-ai/project-assets/train-control-diagram.png" alt="AI System Architecture" className="rounded-lg shadow-xl" />
            </div>
          </div>
        </section>

        {/* KPIs Section */}
        <section>
             <h2 className="text-3xl font-bold text-center mb-10">Measuring Success: Key Performance Indicators</h2>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div><Icon name="throughput" className="w-12 h-12 mx-auto mb-2 text-cyan-400" /><h3 className="font-semibold">Section Throughput</h3><p className="text-sm text-gray-500">Trains per hour</p></div>
                <div><Icon name="punctuality" className="w-12 h-12 mx-auto mb-2 text-green-400" /><h3 className="font-semibold">Punctuality</h3><p className="text-sm text-gray-500">% of on-time arrivals</p></div>
                <div><Icon name="delay" className="w-12 h-12 mx-auto mb-2 text-yellow-400" /><h3 className="font-semibold">Average Delay</h3><p className="text-sm text-gray-500">Mean delay per train</p></div>
                <div><Icon name="utilization" className="w-12 h-12 mx-auto mb-2 text-purple-400" /><h3 className="font-semibold">Track Utilization</h3><p className="text-sm text-gray-500">% of productive track time</p></div>
             </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
