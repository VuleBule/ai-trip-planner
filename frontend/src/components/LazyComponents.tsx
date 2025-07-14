import { lazy } from 'react';

// Lazy load components for better performance
export const RosterBuilderForm = lazy(() => import('./RosterBuilderForm'));
export const TripResults = lazy(() => import('./TripResults'));
export const TripPlannerForm = lazy(() => import('./TripPlannerForm'));
export const ModelSelector = lazy(() => import('./ModelSelector'));