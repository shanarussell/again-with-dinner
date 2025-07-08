import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../contexts/AuthContext';
import UnifiedHeader from '../components/ui/UnifiedHeader';
import UserMenu from '../pages/recipe-dashboard/components/UserMenu';

const features = [
  {
    icon: 'BookOpen',
    title: 'Save Your Recipes',
    description: 'Add your favorite recipes and keep them organized in one place.'
  },
  {
    icon: 'CalendarCheck',
    title: 'Easy Meal Planning',
    description: 'Drag and drop recipes into your weekly meal plan with just a few clicks.'
  },
  {
    icon: 'ShoppingCart',
    title: 'Automatic Shopping List',
    description: 'Generate a smart shopping list from your meal plan or recipes instantly.'
  },
  {
    icon: 'ChefHat',
    title: 'Cooking Mode',
    description: 'Step-by-step, distraction-free mode with timers and ingredient highlights.'
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading, userProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/recipe-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleMenuToggle = () => {
    setIsMenuOpen((open) => !open);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col">
      <UnifiedHeader
        userProfile={userProfile}
        onMenuToggle={handleMenuToggle}
        showSearch={false}
        showNavigation={true}
      />
      <UserMenu
        userProfile={userProfile}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl shadow-md p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex-shrink-0">
                <AppIcon name={feature.icon} size={32} color="#ea580c" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-base">{feature.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
      <footer className="w-full py-8 flex flex-col items-center text-gray-400 text-sm mt-8">
        <span>&copy; {new Date().getFullYear()} Again With Dinner. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Landing; 