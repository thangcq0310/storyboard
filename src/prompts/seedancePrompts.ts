// Seedance 2.0 curated prompts - extracted from awesome-seedance-2.0-prompts repo
export interface SeedancePrompt {
  id: string;
  name: string;
  category: string;
  prompt: string;
  author: string;
  xUrl: string;
}

// Categories: Action/Fantasy, Cinematic Realism, POV/FPV, Commercial, Reference-Driven, Surreal/VFX, Templates, General Cinematic
export const seedancePrompts: SeedancePrompt[] = [
  // Action / Fantasy (top samples)
  {
    id: "action-1",
    name: "Street Rap MV Performance",
    category: "Action / Fantasy",
    prompt: "16:9 horizontal screen, street rap MV style, neon purple and blue cool tones, explosive cool and fierce atmosphere. 0-3 seconds: Medium shot push-in, city street night scene with flashing neon lights, an 80-year-old silver-haired woman stands in front of a graffiti wall, short silver-white hair styled in a neat slick-back, distinct square face contour, sword-like eyebrows slanting towards the temples, eyes sharp like electricity, wrinkles at the corners of her eyes like badges of time, a confident smile on the corner of her mouth, wearing a black leather jacket over a white printed T-shirt + black cargo pants + white high-top sneakers, a thick gold chain necklace around her neck, silver bracelet on her wrist, holding up a microphone with both hands, strong drum beats of the BGM start, the old woman's eyes sharpen, and her lips open to start Rap. 3-7 seconds: Medium shot + close-up switch, the old woman starts rapping, with an extremely strong sense of rhythm, her silver hair flying with her head-nodding movements, one hand holding the microphone, the other hand making gestures to match the rhythm—index finger pointing at the camera, palm cutting the rhythm up and down, making hip-hop gestures, movements are smooth and flowing, eyes sharp and looking directly at the camera. 7-11 seconds: Dance segment, the camera pulls back to show the full body, the old woman starts dancing—first the classic hip-hop bounce, then a neat street dance freeze, followed by a body wave transmitting from the shoulders to the toe. 11-15 seconds: Climax ending, the old woman makes a cool turn, her silver hair arcs in the air, she faces the camera and makes a \"shush\" gesture with her finger, then her lips move closer to the microphone. Low-angle upward shot + 360-degree surrounding shot, capturing the old woman's cool dance moves.",
    author: "@songguoxiansen",
    xUrl: "https://x.com/songguoxiansen/status/2033175478765289598"
  },
  {
    id: "action-2",
    name: "Black Cat Desert Martial-Arts Duel",
    category: "Action / Fantasy",
    prompt: "Cinematic wide shot, Chinese desert landscape at sunset. Two martial artists in black stand in opposite stance on the golden sand. 0-3s: Medium shot, the black cat dashes forward with incredible speed, its form a blur of motion, dust kicks up in spiraling columns. 3-6s: Both fighters engage in rapid exchanges, fists and kicks connecting with crisp audio, their movements flowing like water, each block and strike perfectly timed, the camera orbiting to capture the dynamic angles. 6-9s: One fighter launches a spinning kick, the other ducks and counters with a palm strike, they separate and circle each other. 9-12s: Final exchange, they clash in a burst of sand and motion, one lands a decisive blow, the other falls. 12-15s: The victor stands alone in the golden sunset dust, camera pushes in to their determined face.",
    author: "@nopinduoduo",
    xUrl: "https://x.com/nopinduoduo/status/2039915824216261101"
  },
  {
    id: "action-3",
    name: "Samurai Revenge Short Film",
    category: "Action / Fantasy",
    prompt: "Cinematic 16:9, Japanese feudal era atmosphere. 0-3s: Rain falls on a bamboo forest, a lone samurai walks slowly, blood dripping from his katana. His eyes burning with cold determination through the mist. 3-6s: Flashback montage: his family, his village burning, his master betrayed. 6-9s: He arrives at the enemy's castle gate, the heavy wooden doors creak open. 9-12s: Inside the great hall, enemy guards surround him. He draws his blade in one fluid motion. 12-15s: First guard falls in one strike, then the second, blood sprays in the torchlight, the samurai's face emotionless as he advances.",
    author: "@sailorv321",
    xUrl: "https://x.com/sailorv321/status/2040127822908596305"
  },
  {
    id: "action-4",
    name: "Giant Ninja Tokusatsu Battle",
    category: "Action / Fantasy",
    prompt: "Tokusatsu giant suit battle style, Japanese tokusatsu hero series aesthetic. 0-3s: Giant mecha robot stands in destroyed city, enemy kaijin from the 80s emerge from the rubble. 3-7s: Wide shot, the hero charges forward, running in classic tokusatsu gait, cape billowing dramatically. 7-11s: Mid-action shot, hero catches the enemy's giant pipe weapon, throws them into a building, explosion in background. 11-15s: Hero finishing pose, fist raised, city burning behind, classic hero music cue.",
    author: "@EarthGigantea",
    xUrl: "https://x.com/EarthGigantea/status/2044026356984623194"
  },
  {
    id: "action-5",
    name: "15-Second Original Elemental Battle Short Film",
    category: "Action / Fantasy",
    prompt: "Original elemental battle short film, hyper-realistic style. 0-3s: Fire bender stands on cliff edge, flames swirling around hands, morning light. 3-6s: Water bender emerges from the ocean below, rising walls of water. 6-9s: They clash - fire meets water, massive steam explosion. 9-12s: Tornado of elements, camera spirals around the duel. 12-15s: Both elemental attacks collide in spectacular finale, screen fills with elemental energy.",
    author: "@ZikinArt",
    xUrl: "https://x.com/ZikinArt/status/2040006818953322644"
  },
  // Cinematic Realism
  {
    id: "cinematic-1",
    name: "Modern Japan Documentary Sequence",
    category: "Cinematic Realism",
    prompt: "16:9 documentary style, modern Japan street scene. 0-3s: Wide shot, Shibuya Crossing from above, crowds moving in organized chaos. 3-6s: Tracking shot through the crowd, neon signs reflect on wet pavement. 6-9s: Pull focus to individual businessman checking phone, briefcase in hand. 9-12s: Train station entrance, rush hour energy. 12-15s: Last light of sunset hitting glass buildings, time-lapse transition.",
    author: "@kuranoayashi",
    xUrl: "https://x.com/kuranoayashi/status/2040055299835650266"
  },
  {
    id: "cinematic-2",
    name: "Shadow-Tracking Longboard Descent",
    category: "Cinematic Realism",
    prompt: "POV longboard descent, GoPro mounted. 0-3s: Helmet cam starts at hilltop, cities far below spread out. 3-6s: Push off, speed increases, wind noise. 6-9s: Carving through S-curves, wheels audible on pavement, shadow traces perfect lines. 9-12s: Faster now, blur of passing streetlights. 12-15s: Final slowdown at intersection, rider hops off smoothly, helmet cam looks back at the descent.",
    author: "@Dheepanratnam",
    xUrl: "https://x.com/Dheepanratnam/status/2039982273076810119"
  },
  // POV / FPV
  {
    id: "pov-1",
    name: "Chest-Mounted Camouflage Chase Sequence",
    category: "POV / FPV",
    prompt: "Chest-mounted POV camera, military camouflage aesthetic. 0-3s: Dense jungle, soldier crouching behind vegetation, thermal visible. 3-6s: Quick POV push through branches, footsteps pounding, heavy breathing. 6-9s: Diving through a stream, water splashes the lens. 9-12s: Rolling under barbed wire, dirt kicks up. 12-15s: Reaching the objective, hand signal to team, camera shakes with heartbeat.",
    author: "@genel_ai",
    xUrl: "https://x.com/genel_ai/status/2039538309790404797"
  },
  {
    id: "pov-2",
    name: "Shanghai Cyberpunk City Sizzle Reel",
    category: "POV / FPV",
    prompt: "FPV drone through Shanghai cyberpunk. 0-3s: Rising past neon signs, Chinese characters glow pink and blue. 3-6s: Diving between skyscrapers, LED screens on glass. 6-9s: Through traffic on elevated highway, speed lines. 9-12s: Pull up over The Bund, Huangpu River reflection. 12-15s: Rise past Oriental Pearl Tower, city lights fill frame.",
    author: "@Adam38363368936",
    xUrl: "https://x.com/Adam38363368936/status/2039498800801398911"
  },
  {
    id: "pov-3",
    name: "Y2K Pool Party Camcorder Montage",
    category: "POV / FPV",
    prompt: "Y2K vintage camcorder aesthetic. 0-3s: Grainy DV quality, pool party at night, colored underwater lights. 3-6s: Handheld shake, friends jumping into pool, splash. 6-9s: Close-ups of faces, bright smiles, flash photography. 9-12s: DJ booth, tracking shot past speakers. 12-15s: Group diving in synchronized slow motion, screen filled with splash and joy.",
    author: "@johnAGI168",
    xUrl: "https://x.com/johnAGI168/status/2040628800422322359"
  },
  // Commercial / Product
  {
    id: "commercial-1",
    name: "Tesla Card POV City Burst",
    category: "Commercial / Product",
    prompt: "Tesla Cybertruck commercial, dramatic reveal. 0-3s: Night city, single headlight approaches from distance. 3-6s: Rising to reveal the Cybertruck silhouette, angular design catches light. 6-9s: POV shot through city streets, vehicle handles corners with precision. 9-12s: Pull back to hero shot, city lights reflecting on steel. 12-15s: Logo placement, tagline fade in.",
    author: "@xingsthatmatter",
    xUrl: "https://x.com/xingsthatmatter/status/2040190310043812035"
  },
  // Surreal / VFX
  {
    id: "surreal-1",
    name: "Faberge Fantasy Egg Animation",
    category: "Surreal / VFX",
    prompt: "Fantasy 3D animation, Fabergé egg aesthetic. 0-3s: Golden egg on velvet surface, intricate details render. 3-6s: Egg begins to crack, golden light emanating. 6-9s: Cracks widen, inner light grows brighter. 9-12s: Egg explodes open, miniature fantasy world emerges - castles, fairies. 12-15s: Camera orbits the fantasy world inside the egg, wonder and awe.",
    author: "@ShamiWeb3",
    xUrl: "https://x.com/ShamiWeb3/status/2040096061835059412"
  },
  // General Cinematic
  {
    id: "general-1",
    name: "Slow Motion Coffee Pour",
    category: "General Cinematic",
    prompt: "Aesop-style commercial, dark aesthetics. 0-3s: Close-up hands, ceramic cup on wooden table. 3-6s: Pouring hot water over coffee grounds, steam rises. 6-9s: Slow motion, coffee dripping through filter. 9-12s: Surface tension forms perfect circle in cup. 12-15s: Hand lifts cup, reflection in liquid, logo appears.",
    author: "",
    xUrl: ""
  },
  {
    id: "general-2",
    name: "Fashion Week Runway",
    category: "General Cinematic",
    prompt: "Paris Fashion Week cinematic. 0-3s: Long tracking shot through crowd of photographers. 3-6s: Model emerges, haute couture dress catches light. 6-9s: Stride down runway, camera tracks alongside. 9-12s: Turn at end, dramatic pause, flash photography. 12-15s: Final pose, crowd admiration, slow fade.",
    author: "",
    xUrl: ""
  }
];

// Get prompts by category
export const getPromptsByCategory = (category: string): SeedancePrompt[] => {
  if (category === "All") return seedancePrompts;
  return seedancePrompts.filter(p => p.category === category);
};

// Get all categories
export const getCategories = (): string[] => {
  const categories = [...new Set(seedancePrompts.map(p => p.category))];
  return ["All", ...categories];
};