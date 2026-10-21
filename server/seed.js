const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Asset = require('./models/Asset');
const MaintenanceLog = require('./models/MaintenanceLog');
const Report = require('./models/Report');

dotenv.config();

// Chennai Green Assets: Trees (20 specimens across Chennai)
const treesData = [
  {
    type: 'tree',
    name: 'Heritage Peepal Specimen #01',
    species: 'Ficus religiosa (Arasa Maram / Peepal)',
    age: 65,
    healthStatus: 'Healthy',
    location: { lat: 13.0334, lng: 80.2698 }, // Kapaleeshwarar Grove, Mylapore
    images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800'],
    description: 'Centuries-old heritage sacred fig tree with widespread canopy providing shade to surrounding Mylapore public temple square.',
    plantingDate: new Date('1961-06-15'),
  },
  {
    type: 'tree',
    name: 'Sacred Banyan Landmark #02',
    species: 'Ficus benghalensis (Aala Maram / Great Banyan)',
    age: 150,
    healthStatus: 'Healthy',
    location: { lat: 13.0076, lng: 80.2588 }, // Theosophical Society, Adyar
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800'],
    description: 'Renowned historic Adyar Banyan landmark with expansive aerial prop root system and thriving migratory bird sanctuary.',
    plantingDate: new Date('1876-08-15'),
  },
  {
    type: 'tree',
    name: 'Coastal Casuarina Specimen #03',
    species: 'Casuarina equisetifolia (Savukku)',
    age: 25,
    healthStatus: 'Healthy',
    location: { lat: 13.0540, lng: 80.2830 }, // Marina Beach Promenade
    images: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800'],
    description: 'Salt-tolerant windbreak conifer shielding the coastal boulevard from sea-spray aerosol and sand drift.',
    plantingDate: new Date('2001-07-20'),
  },
  {
    type: 'tree',
    name: 'Ancient Neem Specimen #04',
    species: 'Azadirachta indica (Vembu / Neem)',
    age: 40,
    healthStatus: 'Healthy',
    location: { lat: 13.0320, lng: 80.2780 }, // San Thome High Road
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    description: 'Large medicinal evergreen neem offering natural microclimate cooling and high bio-filtration along San Thome corridor.',
    plantingDate: new Date('1986-04-10'),
  },
  {
    type: 'tree',
    name: 'Royal Flame Gulmohar #05',
    species: 'Delonix regia (Mayil-kondrai / Gulmohar)',
    age: 18,
    healthStatus: 'Healthy',
    location: { lat: 13.0020, lng: 80.2610 }, // Besant Avenue, Adyar
    images: ['https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800'],
    description: 'Vibrant scarlet blooming umbrella-shaped canopy tree along the historic wooded avenue of Besant Nagar.',
    plantingDate: new Date('2008-05-22'),
  },
  {
    type: 'tree',
    name: 'Yellow Copperpod Specimen #06',
    species: 'Peltophorum pterocarpum (Iyalvagai / Copperpod)',
    age: 22,
    healthStatus: 'Healthy',
    location: { lat: 12.9915, lng: 80.2337 }, // IIT Madras Campus Canopy
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
    description: 'Sturdy native copperpod tree flowering with bright golden blossoms; key nesting host for urban hornbills.',
    plantingDate: new Date('2004-09-12'),
  },
  {
    type: 'tree',
    name: 'Sacred Nagalingam #07',
    species: 'Couroupita guianensis (Nagalingam / Cannonball Tree)',
    age: 35,
    healthStatus: 'Healthy',
    location: { lat: 13.0405, lng: 80.2337 }, // Panagal Park, T. Nagar
    images: ['https://images.unsplash.com/photo-1511497584788-87676104235f?w=800'],
    description: 'Iconic botanical specimen producing aromatic spherical floral clusters with strong cultural value.',
    plantingDate: new Date('1991-03-30'),
  },
  {
    type: 'tree',
    name: 'Indian Beech Pungai #08',
    species: 'Pongamia pinnata (Pungai)',
    age: 15,
    healthStatus: 'Healthy',
    location: { lat: 13.0800, lng: 80.2600 }, // Egmore Museum Enclave
    images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800'],
    description: 'Deep-rooted indigenous nitrogen-fixing tree providing dense shade and soil enrichment in central Chennai.',
    plantingDate: new Date('2011-08-10'),
  },
  {
    type: 'tree',
    name: 'Heritage Rain Tree #09',
    species: 'Samanea saman (Thoongu Moonji Maram / Rain Tree)',
    age: 45,
    healthStatus: 'Diseased',
    location: { lat: 13.0600, lng: 80.2450 }, // Nungambakkam High Road
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'],
    description: 'Sprawling mature rain tree showing initial heartwood fungal rot and heavy deadwood along eastern limb.',
    plantingDate: new Date('1981-10-05'),
  },
  {
    type: 'tree',
    name: 'Urban Tamarind Specimen #10',
    species: 'Tamarindus indica (Puliya Maram / Tamarind)',
    age: 30,
    healthStatus: 'Healthy',
    location: { lat: 13.0830, lng: 80.2400 }, // Kilpauk Garden Road
    images: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800'],
    description: 'Hardy drought-resistant evergreen specimen with dense foliage contributing to ambient temperature cooling.',
    plantingDate: new Date('1996-11-01'),
  },
  {
    type: 'tree',
    name: 'Indian Tulip Tree #11',
    species: 'Thespesia populnea (Poovarasu)',
    age: 12,
    healthStatus: 'Healthy',
    location: { lat: 13.0580, lng: 80.2740 }, // Triplicane Urban Belt
    images: ['https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800'],
    description: 'Coast-friendly tree with cup-shaped yellow flowers, widely utilized in urban greening across coastal wards.',
    plantingDate: new Date('2014-06-18'),
  },
  {
    type: 'tree',
    name: 'Red Sandalwood Specimen #12',
    species: 'Pterocarpus santalinus (Sengandham)',
    age: 16,
    healthStatus: 'Diseased',
    location: { lat: 13.1495, lng: 80.2312 }, // Madhavaram Botanical Garden
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'],
    description: 'Protected endemic timber tree suffering from bark borer infestation requiring systematic bio-pesticide treatment.',
    plantingDate: new Date('2010-04-12'),
  },
  {
    type: 'tree',
    name: 'Sacred Sita Ashoka #13',
    species: 'Saraca asoca (Asoka Maram)',
    age: 10,
    healthStatus: 'Healthy',
    location: { lat: 13.0110, lng: 80.2360 }, // Gandhi Mandapam Grove, Guindy
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800'],
    description: 'Shade-loving native evergreen with fragrant orange-red blooms, preserving traditional medicinal arboretum heritage.',
    plantingDate: new Date('2016-07-04'),
  },
  {
    type: 'tree',
    name: 'Desiccated Storm Casuarina #14',
    species: 'Casuarina equisetifolia',
    age: 28,
    healthStatus: 'Dead',
    location: { lat: 13.0280, lng: 80.2790 }, // Foreshore Estate Coast
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'],
    description: 'Dead coastal timber post-monsoon storm surge. Slated for safe crane removal by Greater Chennai Corporation arborists.',
    plantingDate: new Date('1998-02-14'),
  },
  {
    type: 'tree',
    name: 'Pyramidal Silver Oak #15',
    species: 'Grevillea robusta (Silver Oak)',
    age: 14,
    healthStatus: 'Healthy',
    location: { lat: 13.0880, lng: 80.2180 }, // Anna Nagar 2nd Avenue
    images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800'],
    description: 'Fast-growing ornamental shade tree along the planned boulevard avenue of Anna Nagar West.',
    plantingDate: new Date('2012-09-09'),
  },
  {
    type: 'tree',
    name: 'Sacred Bael Vilvam Specimen #16',
    species: 'Aegle marmelos (Vilva Maram)',
    age: 40,
    healthStatus: 'Healthy',
    location: { lat: 12.9860, lng: 80.2610 }, // Marundeeswarar Temple Grove, Thiruvanmiyur
    images: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800'],
    description: 'Medicinal and culturally revered Vilvam tree known for trifoliate leaves and therapeutic aromatic fruits.',
    plantingDate: new Date('1986-05-18'),
  },
  {
    type: 'tree',
    name: 'Golden Shower Amaltas #17',
    species: 'Cassia fistula (Sarakkondrai)',
    age: 15,
    healthStatus: 'Healthy',
    location: { lat: 13.0450, lng: 80.2800 }, // Marina Beach Boulevard
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
    description: 'Flowering native specimen producing pendulous clusters of yellow aromatic flowers during Tamil New Year season.',
    plantingDate: new Date('2011-04-14'),
  },
  {
    type: 'tree',
    name: 'Historic Baobab Tree #18',
    species: 'Adansonia digitata (Aanaipuliyan)',
    age: 220,
    healthStatus: 'Healthy',
    location: { lat: 12.9220, lng: 80.1220 }, // Tambaram Heritage Grove
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800'],
    description: 'Centuries-old bottle trunk African Baobab naturalized in Chennai, boasting enormous water storage capacity and canopy expanse.',
    plantingDate: new Date('1806-03-10'),
  },
  {
    type: 'tree',
    name: 'Coastal Coconut Palm Stand #19',
    species: 'Cocos nucifera (Thennai)',
    age: 20,
    healthStatus: 'Healthy',
    location: { lat: 12.9750, lng: 80.2680 }, // Thiruvanmiyur Beach Front
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    description: 'Slender, flexible coastal palm stand absorbing wind energy and stabilizing maritime sand embankments.',
    plantingDate: new Date('2006-11-20'),
  },
  {
    type: 'tree',
    name: 'Indian Rosewood Specimen #20',
    species: 'Dalbergia latifolia (Eetti Maram)',
    age: 35,
    healthStatus: 'Healthy',
    location: { lat: 13.0650, lng: 80.2350 }, // Chetpet Lake Shore
    images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800'],
    description: 'Valuable indigenous timber species providing high nitrogen-fixation in lake embankment soils.',
    plantingDate: new Date('1991-08-25'),
  },
];

// Chennai Parks (8 prominent parks)
const parksData = [
  {
    type: 'park',
    name: 'Semmozhi Poonga Botanical Garden',
    healthStatus: 'Excellent',
    area: 89000, // 89,000 sq meters (approx 22 acres)
    location: { lat: 13.0520, lng: 80.2505 }, // Cathedral Road, Teynampet
    images: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    description: 'Flagship botanical garden situated in central Chennai featuring exotic and medicinal plants, vertical green walls, bonsai pavilion, and micro-sprinkler misting network.',
  },
  {
    type: 'park',
    name: 'Chetpet EcoPark & Lake',
    healthStatus: 'Good',
    area: 65000, // 65,000 sq meters
    location: { lat: 13.0722, lng: 80.2394 }, // Chetpet
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'],
    description: 'Restored urban lake wetland park with pedestrian jogging corridors, indigenous aquatic flora, aeration fountains, and recreational eco-boating zone.',
  },
  {
    type: 'park',
    name: 'Anna Nagar Tower Park (Dr. Visveswaraya)',
    healthStatus: 'Good',
    area: 110000, // 110,000 sq meters
    location: { lat: 13.0850, lng: 80.2130 }, // Anna Nagar
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800'],
    description: 'Premier civic park anchored by the historic 135-foot observation tower, surrounded by mature canopy trees, open amphitheater, and skating ring.',
  },
  {
    type: 'park',
    name: 'Nageswara Rao Park (Mylapore)',
    healthStatus: 'Good',
    area: 45000, // 45,000 sq meters
    location: { lat: 13.0372, lng: 80.2635 }, // Luz, Mylapore
    images: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    description: 'Vibrant residential heritage park with lush bamboo clusters, yoga pavilions, stone walking pathways, and active senior citizen wellness groups.',
  },
  {
    type: 'park',
    name: 'Tholkappia Poonga (Adyar Eco Park)',
    healthStatus: 'Excellent',
    area: 350000, // 350,000 sq meters (58 acres estuarine wetland)
    location: { lat: 13.0163, lng: 80.2642 }, // Adyar Estuary, Raja Annamalaipuram
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'],
    description: 'Ecologically rehabilitated estuarine wetland sanctuary harboring mangrove species (Avicennia marina), supporting over 140 resident and migratory bird species.',
  },
  {
    type: 'park',
    name: 'Madhavaram Botanical Garden & Arboretum',
    healthStatus: 'Excellent',
    area: 115000, // 115,000 sq meters (28 acres)
    location: { lat: 13.1510, lng: 80.2300 }, // Madhavaram, North Chennai
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800'],
    description: 'Largest botanical garden in North Chennai with themed herbarium gardens, medicinal plant conservatory, and natural bird watching trails.',
  },
  {
    type: 'park',
    name: 'Jeeva Park (T. Nagar)',
    healthStatus: 'Good',
    area: 38000, // 38,000 sq meters
    location: { lat: 13.0430, lng: 80.2390 }, // G.N. Chetty Road, T. Nagar
    images: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    description: 'Serene public green haven providing canopy cooling amidst the bustling retail heart of T. Nagar.',
  },
  {
    type: 'park',
    name: 'Sivan Park (K.K. Nagar)',
    healthStatus: 'Good',
    area: 52000, // 52,000 sq meters
    location: { lat: 13.0380, lng: 80.1980 }, // P.T. Rajan Salai, K.K. Nagar
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'],
    description: 'Community neighborhood park featuring wide walking loops, ornamental flowering shrubs, children recreation zones, and open-air gymnasium.',
  },
];

// Chennai Urban Forests & Biosphere Reserves (5 reserves)
const urbanForestsData = [
  {
    type: 'urban_forest',
    name: 'Guindy National Park & Biosphere Sanctuary',
    healthStatus: 'Excellent',
    area: 2700000, // 2,700,000 sq meters (270 hectares)
    location: { lat: 13.0067, lng: 80.2206 }, // Guindy
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'],
    description: 'One of the few national parks situated entirely inside a metropolitan city, featuring tropical dry evergreen scrub forest, spotted deer, and blackbuck habitat.',
  },
  {
    type: 'urban_forest',
    name: 'Nanmangalam Reserve Forest Sanctuary',
    healthStatus: 'Good',
    area: 3200000, // 3,200,000 sq meters (320 hectares)
    location: { lat: 12.9230, lng: 80.1800 }, // Nanmangalam, South Chennai
    images: ['https://images.unsplash.com/photo-1511497584788-87676104235f?w=800'],
    description: 'Dense scrub reserve forest renowned as a haven for the great horned owl and native reptiles, functioning as a vital groundwater recharge zone.',
  },
  {
    type: 'urban_forest',
    name: 'Pallikaranai Marshland Conservation Reserve',
    healthStatus: 'Fair',
    area: 1200000, // 1,200,000 sq meters
    location: { lat: 12.9360, lng: 80.2140 }, // Pallikaranai
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800'],
    description: 'Ramsar wetland site absorbing South Chennai monsoon floodwaters and acting as a natural biological filter for the surrounding urban sprawl.',
  },
  {
    type: 'urban_forest',
    name: 'Kotturpuram Tree Park (Adyar River Bank Bio-Park)',
    healthStatus: 'Good',
    area: 150000, // 150,000 sq meters
    location: { lat: 13.0220, lng: 80.2430 }, // Kotturpuram
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800'],
    description: 'Restored riverbank biodiversity park planted with over 40 indigenous tree species stabilizing riparian Adyar banks.',
  },
  {
    type: 'urban_forest',
    name: 'Thiruvanmiyur Coastal Sand Dune Bio-Reserve',
    healthStatus: 'Good',
    area: 450000, // 450,000 sq meters
    location: { lat: 12.9780, lng: 80.2660 }, // South Chennai Coast
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    description: 'Protected coastal dune ecosystem supporting nesting Olive Ridley sea turtles and saline-tolerant ground vegetation.',
  },
];

// Chennai Green Belts & Linear Corridors (5 belts)
const greenBeltsData = [
  {
    type: 'green_belt',
    name: 'Marina Beach Promenade Green Belt',
    healthStatus: 'Good',
    area: 220000, // 220,000 sq meters
    location: { lat: 13.0500, lng: 80.2824 }, // Marina Promenade, Kamarajar Salai
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    description: 'Continuous coastal tree avenue planted with casuarinas, palms, and flowering shrubs providing micro-cooling along Chennai coastline.',
  },
  {
    type: 'green_belt',
    name: 'OMR IT Expressway Green Spine (Rajiv Gandhi Salai)',
    healthStatus: 'Fair',
    area: 180000, // 180,000 sq meters
    location: { lat: 12.9720, lng: 80.2500 }, // Perungudi - Thoraipakkam Corridor
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
    description: 'Multi-tiered vehicular pollution buffer and median drip-irrigated boulevard traversing the southern IT growth corridor.',
  },
  {
    type: 'green_belt',
    name: 'Besant Nagar Coastal Green Buffer',
    healthStatus: 'Good',
    area: 130000, // 130,000 sq meters
    location: { lat: 12.9996, lng: 80.2708 }, // Elliot Beach & 6th Avenue
    images: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    description: 'Canopy corridor featuring tropical rain trees, pongamia, and flowering gulmohar trees stabilizing coastal sands and mitigating sea breezes.',
  },
  {
    type: 'green_belt',
    name: 'Velachery - Tambaram MRTS Vegetated Corridor',
    healthStatus: 'Fair',
    area: 140000, // 140,000 sq meters
    location: { lat: 12.9550, lng: 80.2050 }, // Velachery Main Road
    images: ['https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800'],
    description: 'Linear green strip bordering suburban rail tracks to suppress dust emissions and absorb urban acoustic vibrations.',
  },
  {
    type: 'green_belt',
    name: 'Ennore Creek Mangrove Green Barrier',
    healthStatus: 'Fair',
    area: 290000, // 290,000 sq meters
    location: { lat: 13.2100, lng: 80.3200 }, // Ennore Creek, North Chennai
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800'],
    description: 'Estuarine mangrove tree corridor mitigating industrial particulate emissions and protecting coastal backwaters.',
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing Asset, MaintenanceLog, and Report collections...');
    await Asset.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await Report.deleteMany({});

    // Ensure Admin & Citizen Users exist
    let adminUser = await User.findOne({ email: 'admin@citygreen.gov' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Chennai Green Admin',
        email: 'admin@citygreen.gov',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('[Seed] Created default Chennai admin user.');
    }

    let citizenUser = await User.findOne({ email: 'citizen@citygreen.gov' });
    if (!citizenUser) {
      citizenUser = await User.create({
        name: 'Chennai Citizen Steward',
        email: 'citizen@citygreen.gov',
        password: 'Citizen@123',
        role: 'citizen',
      });
      console.log('[Seed] Created default Chennai citizen user for reporting.');
    }

    // 1. Seed Assets (Trees, Parks, Urban Forests, Green Belts in Chennai)
    console.log('[Seed] Inserting 20 Chennai trees...');
    const createdTrees = await Asset.insertMany(treesData);

    console.log('[Seed] Inserting 8 Chennai parks...');
    const createdParks = await Asset.insertMany(parksData);

    console.log('[Seed] Inserting 5 Chennai urban forests...');
    const createdForests = await Asset.insertMany(urbanForestsData);

    console.log('[Seed] Inserting 5 Chennai green belts...');
    const createdGreenBelts = await Asset.insertMany(greenBeltsData);

    const totalAssets = createdTrees.length + createdParks.length + createdForests.length + createdGreenBelts.length;
    console.log(`[Seed] Total Chennai Green Assets inserted: ${totalAssets}`);

    // 2. Seed 8 Municipal Maintenance Logs
    console.log('[Seed] Inserting 8 municipal maintenance logs...');
    const maintenanceData = [
      {
        assetId: createdTrees[0]._id, // Peepal at Mylapore
        date: new Date('2026-08-10'),
        action: 'Canopy Trimming & Structural Pruning',
        performedBy: 'Greater Chennai Corporation (GCC) Zone 9 Arborist Unit',
        notes: 'Pruned overextended branches over Kapaleeshwarar North Mada St; applied organic sealant to prune wounds.',
      },
      {
        assetId: createdTrees[8]._id, // Rain tree at Nungambakkam (Diseased)
        date: new Date('2026-09-02'),
        action: 'Phytosanitary Fungicide Spray & Root Inoculation',
        performedBy: 'Tamil Nadu Horticultural Pathology Cell',
        notes: 'Treated heartwood fungus with bio-fungicide formulation; introduced mycorrhizal root inoculants to enhance nutrient uptake.',
      },
      {
        assetId: createdParks[0]._id, // Semmozhi Poonga
        date: new Date('2026-08-25'),
        action: 'Micro-Drip Telemetry & Mist Nozzle Overhaul',
        performedBy: 'Chennai Eco-Park Hydrotech Maintenance',
        notes: 'Calibrated automated soil-moisture telemetry sensors across botanical sections; replaced 18 clogged mist nozzles.',
      },
      {
        assetId: createdGreenBelts[0]._id, // Marina Green Belt
        date: new Date('2026-09-08'),
        action: 'Desalination Wash & Organic Mulching',
        performedBy: 'Marina Coastal Vegetation Crew',
        notes: 'Applied fresh compost and wood-chip mulching layer to conserve sub-surface moisture against coastal wind evaporation.',
      },
      {
        assetId: createdTrees[13]._id, // Dead Casuarina at Foreshore Estate
        date: new Date('2026-09-15'),
        action: 'Hazard Arborist Inspection & Felling Order',
        performedBy: 'GCC Disaster Preparedness & Forestry Cell',
        notes: 'Confirmed 100% structural loss. Scheduled hydraulic crane dismantling to eliminate cyclone toppling risk.',
      },
      {
        assetId: createdTrees[15]._id, // Bael Vilvam at Thiruvanmiyur
        date: new Date('2026-09-22'),
        action: 'Soil Aeration & Vermicompost Dressing',
        performedBy: 'South Chennai Heritage Tree Guardians',
        notes: 'Loosened compacted soil within 3m root drip-line; applied 40kg aged vermicompost for root vitality.',
      },
      {
        assetId: createdParks[1]._id, // Chetpet EcoPark
        date: new Date('2026-09-28'),
        action: 'Aeration Fountain Pump Filter Service',
        performedBy: 'Chennai Inland Wetland Authority',
        notes: 'Serviced biological filter media to optimize dissolved oxygen levels for littoral marginal plants.',
      },
      {
        assetId: createdForests[3]._id, // Kotturpuram Tree Park
        date: new Date('2026-10-05'),
        action: 'Native Sapling Staking & Storm Protection',
        performedBy: 'Nizhal Tree Conservation NGO & GCC Crew',
        notes: 'Tied bamboo stakes to 50 juvenile saplings in preparation for Northeast monsoon wind gusts.',
      },
    ];
    const createdLogs = await MaintenanceLog.insertMany(maintenanceData);
    console.log(`[Seed] Inserted ${createdLogs.length} maintenance logs.`);

    // 3. Seed 6 Citizen Reports across Chennai Wards
    console.log('[Seed] Inserting 6 Chennai citizen hazard reports...');
    const reportsData = [
      {
        citizenId: citizenUser._id,
        assetId: createdTrees[8]._id, // Rain tree at Nungambakkam
        description: 'Noticeable bark peeling and mushroom clusters on trunk. Branch overhanging the road appears weak in high winds.',
        photo: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600',
        location: { lat: 13.0605, lng: 80.2455 }, // Nungambakkam
        status: 'In Progress',
        createdAt: new Date('2026-09-01T14:30:00Z'),
      },
      {
        citizenId: citizenUser._id,
        assetId: createdParks[0]._id, // Semmozhi Poonga
        description: 'Irrigation drip line rupture near fragrance plant pavilion causing localized water pooling on pathway.',
        photo: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600',
        location: { lat: 13.0522, lng: 80.2510 }, // Semmozhi Poonga
        status: 'Resolved',
        createdAt: new Date('2026-08-20T09:15:00Z'),
      },
      {
        citizenId: citizenUser._id,
        assetId: null, // General citizen location report
        description: 'Heavy fallen branch blocking pedestrian cycling track along Besant Avenue after overnight coastal squall.',
        photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600',
        location: { lat: 13.0025, lng: 80.2615 }, // Besant Avenue
        status: 'Pending',
        createdAt: new Date('2026-09-17T17:45:00Z'),
      },
      {
        citizenId: citizenUser._id,
        assetId: createdTrees[6]._id, // Nagalingam at Panagal Park
        description: 'Lower branches touching low-hanging telecom cables along the South Usman Road side boundary.',
        photo: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=600',
        location: { lat: 13.0408, lng: 80.2340 }, // T. Nagar
        status: 'Pending',
        createdAt: new Date('2026-10-02T10:15:00Z'),
      },
      {
        citizenId: citizenUser._id,
        assetId: createdGreenBelts[1]._id, // OMR IT Corridor
        description: 'Monsoon puddle accumulation suffocating roadside juvenile saplings near Perungudi toll gate plaza.',
        photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
        location: { lat: 12.9690, lng: 80.2480 }, // OMR Perungudi
        status: 'In Progress',
        createdAt: new Date('2026-10-08T16:20:00Z'),
      },
      {
        citizenId: citizenUser._id,
        assetId: createdParks[2]._id, // Anna Nagar Tower Park
        description: 'Dry palm fronds hanging precariously above the children roller skating rink area.',
        photo: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600',
        location: { lat: 13.0855, lng: 80.2135 }, // Anna Nagar
        status: 'Resolved',
        createdAt: new Date('2026-09-25T11:00:00Z'),
      },
    ];
    const createdReports = await Report.insertMany(reportsData);
    console.log(`[Seed] Inserted ${createdReports.length} citizen reports.`);

    // Verification Summary
    console.log('\n================ SEEDING VERIFICATION (EXPANDED CHENNAI) ================');
    const counts = {
      trees: await Asset.countDocuments({ type: 'tree' }),
      parks: await Asset.countDocuments({ type: 'park' }),
      urban_forests: await Asset.countDocuments({ type: 'urban_forest' }),
      green_belts: await Asset.countDocuments({ type: 'green_belt' }),
      total_assets: await Asset.countDocuments(),
      maintenance_logs: await MaintenanceLog.countDocuments(),
      citizen_reports: await Report.countDocuments(),
    };

    console.table(counts);

    console.log('\n[Sample Chennai Green Asset]:');
    const sampleTree = await Asset.findOne({ type: 'tree' });
    console.log({
      _id: sampleTree._id,
      name: sampleTree.name,
      species: sampleTree.species,
      healthStatus: sampleTree.healthStatus,
      location: sampleTree.location,
    });

    console.log('\n================ EXPANDED SEEDING COMPLETE ================');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();
