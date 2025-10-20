/**
 * WelcomeScreen Component
 * Displays when no conversation is active
 */

import { motion } from 'framer-motion';
import { Sparkles, FileText, Users, Lightbulb } from 'lucide-react';

const suggestions = [
  {
    icon: FileText,
    title: 'What is a superworker?',
    description: 'Learn about high-performance team members',
  },
  {
    icon: Lightbulb,
    title: 'Help me brainstorm',
    description: 'Generate creative ideas for your project',
  },
  {
    icon: Users,
    title: 'Analyze data',
    description: 'Get insights from your documents',
  },
];

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to SuperWorker
        </h1>
        <p className="text-gray-600">
          How can I help you today?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-4 rounded-xl hover:shadow-lg transition-all text-left border hover:border-primary/30 group"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <suggestion.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-gray-900 mb-1 text-sm">
              {suggestion.title}
            </h3>
            <p className="text-xs text-gray-500">
              {suggestion.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

