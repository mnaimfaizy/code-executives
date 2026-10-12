import { createContext } from 'react';

/**
 * Ids of the exercises whose solution this viewer has seen. The Exercises menu reads it
 * here because the toolbar sits between it and the Playground's state.
 */
export const SolutionSeenContext = createContext<ReadonlySet<string>>(new Set<string>());
