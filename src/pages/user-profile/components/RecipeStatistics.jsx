import React from 'react';
import Icon from '../../../components/AppIcon';

const RecipeStatistics = ({ userProfile }) => {
  // Mock statistics data - in a real app, this would come from the API
  const statistics = {
    totalRecipes: 42,
    favoriteRecipes: 12,
    recipesCreated: 8,
    recipesImported: 34,
    mostUsedCategory: 'Dinner',
    cookingStreak: 7,
    achievements: [
      { id: 1, name: 'Recipe Collector', description: 'Saved 25+ recipes', icon: 'BookOpen', earned: true },
      { id: 2, name: 'Cooking Enthusiast', description: 'Cooked 50+ meals', icon: 'ChefHat', earned: false },
      { id: 3, name: 'Meal Planner', description: 'Planned 10+ weeks', icon: 'Calendar', earned: true },
      { id: 4, name: 'Recipe Creator', description: 'Created 5+ original recipes', icon: 'PlusCircle', earned: true }
    ]
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recipe Statistics</h2>
        <Icon name="TrendingUp" size={24} color="#10B981" />
      </div>

      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.totalRecipes}</div>
            <div className="text-sm text-green-700">Total Recipes</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.favoriteRecipes}</div>
            <div className="text-sm text-blue-700">Favorites</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{statistics.recipesCreated}</div>
            <div className="text-sm text-purple-700">Created</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{statistics.cookingStreak}</div>
            <div className="text-sm text-orange-700">Day Streak</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon name="Star" size={20} color="#F59E0B" />
              <span className="text-sm font-medium text-gray-700">Most Used Category</span>
            </div>
            <span className="text-sm text-gray-600">{statistics.mostUsedCategory}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon name="Download" size={20} color="#8B5CF6" />
              <span className="text-sm font-medium text-gray-700">Recipes Imported</span>
            </div>
            <span className="text-sm text-gray-600">{statistics.recipesImported}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon name="Calendar" size={20} color="#10B981" />
              <span className="text-sm font-medium text-gray-700">Member Since</span>
            </div>
            <span className="text-sm text-gray-600">
              {formatJoinDate(userProfile?.created_at)}
            </span>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Achievements</h3>
          <div className="space-y-3">
            {statistics.achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.earned
                    ? 'border-green-200 bg-green-50' :'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.earned ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <Icon 
                    name={achievement.icon} 
                    size={20} 
                    color={achievement.earned ? 'white' : '#6B7280'} 
                  />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    achievement.earned ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {achievement.name}
                  </div>
                  <div className={`text-xs ${
                    achievement.earned ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </div>
                </div>
                {achievement.earned && (
                  <Icon name="CheckCircle" size={20} color="#10B981" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeStatistics;