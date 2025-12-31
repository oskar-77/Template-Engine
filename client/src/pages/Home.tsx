import { useState } from "react";
import { ParticleViewer } from "@/components/ParticleViewer";
import { useTemplates, useDeleteTemplate } from "@/hooks/use-templates";
import { useShapeDescriptions, useUpdateShapeDescription } from "@/hooks/use-shape-descriptions";
import { GlassCard } from "@/components/GlassCard";
import { UploadButton } from "@/components/UploadButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Atom, Grid, Activity, CircleDot, Waves, Box, Pyramid, Tornado, Flower2, Stars, Heart, Droplets, Infinity, Zap, Cloud, Dices, Hexagon, Repeat2, Triangle, Sparkles, Cylinder, BarChart3, TrendingUp, Layers, Network, Wind, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

// Standard preset definitions with icons
const PRESETS = [
  { id: 'sphere', name: 'Sphere', icon: Atom },
  { id: 'grid', name: 'Grid', icon: Grid },
  { id: 'helix', name: 'DNA Helix', icon: Activity },
  { id: 'torus', name: 'Torus', icon: CircleDot },
  { id: 'wave', name: 'Wave', icon: Waves },
  { id: 'cube', name: 'Cube', icon: Box },
  { id: 'pyramid', name: 'Pyramid', icon: Pyramid },
  { id: 'spiral', name: 'Spiral', icon: Tornado },
  { id: 'flower', name: 'Flower', icon: Flower2 },
  { id: 'galaxy', name: 'Galaxy', icon: Stars },
  { id: 'heart', name: 'Heart', icon: Heart },
  { id: 'fountain', name: 'Fountain', icon: Droplets },
  { id: 'doublehelix', name: 'Double Helix', icon: Infinity },
  { id: 'vortex', name: 'Vortex', icon: Zap },
  { id: 'nebula', name: 'Nebula', icon: Cloud },
  { id: 'octahedron', name: 'Octahedron', icon: Dices },
  { id: 'icosahedron', name: 'Icosahedron', icon: Hexagon },
  { id: 'mobius', name: 'Möbius Strip', icon: Repeat2 },
  { id: 'cone', name: 'Cone', icon: Triangle },
  { id: 'starburst', name: 'Starburst', icon: Sparkles },
  { id: 'cylinder', name: 'Cylinder', icon: Cylinder },
  { id: 'bars', name: 'Bar Chart', icon: BarChart3 },
  { id: 'curve', name: 'Bezier Curve', icon: TrendingUp },
  { id: 'layers', name: 'Layers', icon: Layers },
  { id: 'network', name: 'Network', icon: Network },
  { id: 'rings', name: 'Rings', icon: Wind },
];

export default function Home() {
  const [activeMode, setActiveMode] = useState<string>('sphere');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [editingShape, setEditingShape] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  const { data: templates = [], isLoading } = useTemplates();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();
  const { data: descriptions = [] } = useShapeDescriptions();
  const { mutate: updateDescription, isPending: isUpdating } = useUpdateShapeDescription();

  const getShapeDescription = (shapeId: string) => {
    return descriptions.find(d => d.shapeId === shapeId);
  };

  const openEditDialog = (shapeId: string, defaultTitle?: string) => {
    const existing = getShapeDescription(shapeId);
    const preset = PRESETS.find(p => p.id === shapeId);
    setEditingShape(shapeId);
    setEditTitle(existing?.title || defaultTitle || preset?.name || '');
    setEditDescription(existing?.description || '');
  };

  const handleSaveDescription = () => {
    if (editingShape) {
      updateDescription({
        shapeId: editingShape,
        title: editTitle,
        description: editDescription,
      }, {
        onSuccess: () => {
          setEditingShape(null);
        },
      });
    }
  };

  const getCurrentShapeDescription = () => {
    if (activeMode === 'custom' && activeTemplateId) {
      return getShapeDescription(`template-${activeTemplateId}`);
    }
    return getShapeDescription(activeMode);
  };

  const getCurrentShapeTitle = () => {
    if (activeMode === 'custom' && activeTemplateId) {
      const template = templates.find(t => t.id === activeTemplateId);
      const desc = getShapeDescription(`template-${activeTemplateId}`);
      return desc?.title || template?.name || 'Custom Shape';
    }
    const preset = PRESETS.find(p => p.id === activeMode);
    const desc = getShapeDescription(activeMode);
    return desc?.title || preset?.name || activeMode;
  };

  const handlePresetClick = (mode: string) => {
    setActiveMode(mode);
    setCustomImage(null);
    setActiveTemplateId(null);
  };

  const handleTemplateClick = (template: any) => {
    setActiveMode('custom');
    setCustomImage(template.imageUrl);
    setActiveTemplateId(template.id);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* 3D Background - Re-renders when mode changes to reset simulation */}
      <ParticleViewer 
        key={`${activeMode}-${customImage?.substring(0, 10)}`} 
        mode={activeMode} 
        customImageData={customImage} 
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 md:p-8 flex flex-col md:flex-row justify-between">
        
        {/* Left Panel: Info */}
        <div className="w-full md:w-80 pointer-events-auto space-y-4 flex flex-col">
          <GlassCard>
            <h1 className="text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
              Mr.OSKAR
            </h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm border-b border-primary/20 pb-2">
                <span className="text-primary">Current Mode</span>
                <span className="font-bold uppercase tracking-wider">{getCurrentShapeTitle()}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-primary/20 pb-2">
                <span className="text-primary">Particles</span>
                <span className="font-mono">20,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary">Physics</span>
                <span className="font-mono">ACTIVE</span>
              </div>
            </div>
            
            <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
              Use your mouse to interact with the particle field.
              <br />
              <span className="text-primary/70">Hover</span> to repel.
            </p>
          </GlassCard>

          {/* Description Card */}
          {getCurrentShapeDescription() && (
            <GlassCard className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Information</h3>
                <button
                  onClick={() => {
                    const shapeId = activeMode === 'custom' && activeTemplateId ? `template-${activeTemplateId}` : activeMode;
                    const template = activeTemplateId ? templates.find(t => t.id === activeTemplateId) : null;
                    openEditDialog(shapeId, template?.name);
                  }}
                  className="p-1.5 rounded hover:bg-primary/20 text-primary/60 hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <ScrollArea className="flex-1">
                <div className="prose prose-invert prose-sm max-w-none text-xs text-muted-foreground">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold text-primary mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold text-primary/90 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm font-bold text-primary/80 mb-1" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      code: ({node, ...props}) => <code className="bg-black/50 px-1.5 py-0.5 rounded text-primary/80 font-mono" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-2 italic opacity-80" {...props} />,
                    }}
                  >
                    {getCurrentShapeDescription()?.description || ''}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </GlassCard>
          )}
        </div>

        {/* Right Panel: Controls */}
        <div className="w-full md:w-96 mt-4 md:mt-0 pointer-events-auto flex flex-col h-[60vh] md:h-auto md:max-h-[calc(100vh-4rem)]">
          <GlassCard className="flex flex-col h-full overflow-hidden p-0">
            <div className="p-4 border-b border-white/10 bg-black/20">
              <h2 className="font-display font-bold text-lg tracking-widest text-primary">SHAPE DATABASE</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                
                {/* Standard Presets */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 px-1">Standard Models</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map((preset) => {
                      const desc = getShapeDescription(preset.id);
                      return (
                        <div key={preset.id} className="relative group">
                          <button
                            onClick={() => handlePresetClick(preset.id)}
                            className={`
                              w-full flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200
                              ${activeMode === preset.id 
                                ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,255,204,0.3)]' 
                                : 'bg-black/40 border-white/10 hover:border-primary/50 hover:bg-white/5'}
                            `}
                          >
                            <preset.icon 
                              className={`w-6 h-6 mb-2 transition-colors ${activeMode === preset.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} 
                            />
                            <span className="text-[10px] uppercase font-bold tracking-wider">{preset.name}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(preset.id);
                            }}
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/80 hover:bg-primary p-1 rounded-full"
                            title="Edit description"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Templates */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 px-1 flex justify-between items-center">
                    <span>User Scans</span>
                    {isLoading && <span className="text-[10px] animate-pulse text-primary">SYNCING...</span>}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <AnimatePresence>
                      {templates.map((template) => (
                        <motion.div
                          key={template.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`
                            relative rounded-lg overflow-hidden border cursor-pointer group h-24
                            ${activeMode === 'custom' && customImage === template.imageUrl
                              ? 'border-accent shadow-[0_0_15px_rgba(119,0,255,0.4)]' 
                              : 'border-white/10 hover:border-accent/50'}
                          `}
                          onClick={() => handleTemplateClick(template)}
                        >
                          <img 
                            src={template.imageUrl} 
                            alt={template.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                          
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(`template-${template.id}`, template.name);
                              }}
                              className="p-2 bg-primary/80 hover:bg-primary rounded-full transition-colors"
                              title="Edit description"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                            <span className="text-xs font-bold truncate">{template.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/20 -mr-1 -mb-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTemplate(template.id);
                              }}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Empty State */}
                    {templates.length === 0 && !isLoading && (
                      <div className="col-span-2 py-8 text-center border border-dashed border-white/10 rounded-lg">
                        <span className="text-xs text-muted-foreground">No custom scans found</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-xl">
              <UploadButton />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Edit Description Dialog */}
      <Dialog open={!!editingShape} onOpenChange={(open) => !open && setEditingShape(null)}>
        <DialogContent className="max-w-2xl bg-black/90 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Edit Shape Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-primary">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-black/50 border-white/10 text-white mt-2"
                placeholder="Shape title"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-primary">Description (Markdown)</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-black/50 border-white/10 text-white mt-2 min-h-[200px]"
                placeholder="Shape description with markdown support..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingShape(null)}>Cancel</Button>
            <Button 
              onClick={handleSaveDescription} 
              disabled={isUpdating}
              className="bg-primary/80 hover:bg-primary"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
