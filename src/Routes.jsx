import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from './pages/Landing.jsx';

// Lazy load components for better performance
const UserRegistration = lazy(() => import("./pages/user-registration"));
const UserLogin = lazy(() => import("./pages/user-login"));
const RecipeCreationEdit = lazy(() => import("./pages/recipe-creation-edit"));
const RecipeDetailView = lazy(() => import("./pages/recipe-detail-view"));
const RecipeDashboard = lazy(() => import("./pages/recipe-dashboard"));
const Favorites = lazy(() => import("./pages/favorites"));
const WeeklyMealPlanner = lazy(() => import("./pages/weekly-meal-planner"));
const RecipeSearchModal = lazy(() => import("./pages/recipe-search-modal"));
const ShoppingList = lazy(() => import("./pages/shopping-list"));
const PublicRecipeView = lazy(() => import("./pages/public-recipe-view"));
const UserMenuDropdown = lazy(() => import("./pages/user-menu-dropdown"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for lazy-loaded routes
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Route configuration for better organization
const routes = [
  {
    path: "/",
    element: <Landing />,
    protected: false
  },
  {
    path: "/user-registration",
    element: <UserRegistration />,
    protected: false
  },
  {
    path: "/user-login",
    element: <UserLogin />,
    protected: false
  },
  {
    path: "/recipe-creation-edit",
    element: <RecipeCreationEdit />,
    protected: true
  },
  {
    path: "/recipe-detail-view",
    element: <RecipeDetailView />,
    protected: true
  },
  {
    path: "/recipe-dashboard",
    element: <RecipeDashboard />,
    protected: true
  },
  {
    path: "/favorites",
    element: <Favorites />,
    protected: true
  },
  {
    path: "/weekly-meal-planner",
    element: <WeeklyMealPlanner />,
    protected: true
  },
  {
    path: "/shopping-list",
    element: <ShoppingList />,
    protected: true
  },
  {
    path: "/recipe-search-modal",
    element: <RecipeSearchModal />,
    protected: true
  },
  {
    path: "/user-menu-dropdown",
    element: <UserMenuDropdown />,
    protected: true
  },
  {
    path: "/public-recipe-view/:recipeId",
    element: <PublicRecipeView />,
    protected: false
  }
];

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <RouterRoutes>
            {routes.map(({ path, element, protected: isProtected }) => (
              <Route
                key={path}
                path={path}
                element={
                  isProtected ? (
                    <ProtectedRoute>{element}</ProtectedRoute>
                  ) : (
                    element
                  )
                }
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;