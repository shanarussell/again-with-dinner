import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/recipe-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col">
      <header className="w-full py-8 px-4 md:px-0 flex flex-col items-center">
        <div className="flex items-center space-x-3 mb-4">
          <AppIcon name="ChefHat" size={40} color="#16a34a" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Again With Dinner</h1>
        </div>
        <p className="text-lg md:text-2xl text-gray-700 font-medium text-center max-w-2xl mb-6">
          Plan, shop, and cook without the mental load.
        </p>
        <p className="text-base md:text-lg text-gray-600 text-center max-w-xl mb-8">
          Just add your recipes, create easy meal plans, and get an automatic shopping list. Cooking mode makes prep easier than ever — so you can finally stop dreading dinner.
        </p>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg text-lg transition-colors mb-4"
          onClick={() => navigate('/user-registration')}
        >
          Get Started Free
        </button>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            className="bg-white border border-green-600 text-green-700 font-semibold px-6 py-2 rounded-lg shadow hover:bg-green-50 transition-colors"
            onClick={() => navigate('/user-login')}
          >
            Log In
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors"
            onClick={() => navigate('/user-registration')}
          >
            Sign Up
          </button>
        </div>
      </header>

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