import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UnifiedHeader from '../../components/ui/UnifiedHeader';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import Icon from '../../components/AppIcon';
import AccountSettings from './components/AccountSettings';
import UserPreferences from './components/UserPreferences';
import RecipeStatistics from './components/RecipeStatistics';
import RecipeExport from './components/RecipeExport';
import DeleteAccount from './components/DeleteAccount';

const UserProfile = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader 
          title="Profile" 
          showUserMenu={false}
          showBack={true}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        title="Profile" 
        showUserMenu={false}
        showBack={true}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <Icon name="User" size={32} color="white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {userProfile?.full_name || 'User'}
              </h1>
              <p className="text-gray-600">{userProfile?.email || user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Icon name="Calendar" size={16} color="#6B7280" />
                <span className="text-sm text-gray-500">
                  Member since {userProfile?.created_at ? 
                    new Date(userProfile.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    }) : 'Recently'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* Desktop: Two Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
            <div className="space-y-6">
              <AccountSettings userProfile={userProfile} />
              <RecipeStatistics userProfile={userProfile} />
              <DeleteAccount />
            </div>
            <div className="space-y-6">
              <UserPreferences userProfile={userProfile} />
              <RecipeExport />
            </div>
          </div>

          {/* Mobile: Single Column Layout */}
          <div className="lg:hidden space-y-6">
            <AccountSettings userProfile={userProfile} />
            <UserPreferences userProfile={userProfile} />
            <RecipeStatistics userProfile={userProfile} />
            <RecipeExport />
            <DeleteAccount />
          </div>
        </div>
      </div>

      <BottomTabNavigation />
    </div>
  );
};

export default UserProfile;