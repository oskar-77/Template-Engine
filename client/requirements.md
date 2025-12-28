## Packages
three | For 3D particle rendering
@types/three | Types for Three.js
framer-motion | For smooth UI animations and glassmorphism effects
clsx | For conditional class names
tailwind-merge | For merging tailwind classes

## Notes
The application relies heavily on WebGL.
Hand tracking is simulated via mouse interaction/particle physics due to library complexity constraints in this environment, but the architecture allows for future MediaPipe integration.
Custom templates convert images to particle positions via canvas pixel analysis.
