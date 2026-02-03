Integration Plan: Port plantar-3d 3D Viewer into plant-explorer-ar                                                                                                          
                                                                                                                                                                              
  1. Add dependencies                                                                                                                                                         
                                                                                                                                                                              
  Install @react-three/fiber, @react-three/drei, and three (already present) in plant-explorer-ar.                                                                            
                                                                                                                                                                              
  2. Port the 3D component                                                                                                                                                    
                                                                                                                                                                              
  - Copy plantar-3d/components/PlantScene.tsx into plant-explorer-ar/src/components/plant/                                                                                    
  - Convert from TypeScript to JSX (or add TS support)                                                                                                                        
  - Adapt it to accept dynamic plant data props (name, parts, colors) instead of the hardcoded sunflower                                                                      
                                                                                                                                                                              
  3. Replace the existing viewer                                                                                                                                              
                                                                                                                                                                              
  - Replace the current imperative Three.js PlantViewer3D.jsx with a new wrapper that renders the R3F <Canvas> and the ported PlantScene                                      
  - Keep the same props interface (plant, parts, selectedPart, onPartClick) so PlantExplorer.jsx page doesn't need major changes                                              
                                                                                                                                                                              
  4. Port supporting components                                                                                                                                               
                                                                                                                                                                              
  - Bring over PlantExplorer.tsx control panel UI (auto-rotate toggle, labels toggle, lighting slider, zoom controls) as an overlay inside the canvas wrapper                 
  - Keep the existing PlantPartInfo.jsx as-is — it already handles part selection display and text-to-speech                                                                  
                                                                                                                                                                              
  5. Clean up                                                                                                                                                                 
                                                                                                                                                                              
  - Remove old imperative Three.js code from PlantViewer3D.jsx                                                                                                                
  - Remove plantar-3d as a standalone project once verified working