// Sentry must be initialized before all other imports.
// Loaded via main.ts as the first import.
import { initSentry } from './config/sentry';
initSentry();
