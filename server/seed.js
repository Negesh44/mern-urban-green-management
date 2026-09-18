const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Asset = require('./models/Asset');
const MaintenanceLog = require('./models/MaintenanceLog');
const Report = require('./models/Report');

dotenv.config();

const treesData = [
  {
    type: 'tree',
    name: 'Heritage Peepal Specimen #01',
    species: 'Ficus religiosa (Peepal)',
    age: 55,
    healthStatus: 'Healthy',
    location: { lat: 28.6129, lng: 77.2295 },
    images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800'],
    description: 'Centuries-old heritage sacred fig tree with widespread canopy providing shade to surrounding public square.',
    plantingDate: new Date('1971-06-15'),
  },
  {
    type: 'tree',
    name: 'Sacred Banyan Landmark #02',
    species: 'Ficus benghalensis (Banyan)',
    age: 80,
    healthStatus: 'Healthy',
    location: { lat: 28.6145, lng: 77.2090 },
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800'],
    description: 'Prominent landmark banyan with expansive aerial prop root system and thriving bird nesting sanctuary.',
    plantingDate: new Date('1946-08-15'),
  },
  {
    type: 'tree',
    name: 'Urban Medicinal Neem #03',
    species: 'Azadirachta indica (Neem)',
    age: 18,
    healthStatus: 'Healthy',
    location: { lat: 28.6250, lng: 77.2180 },
    images: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800'],
    description: 'Mature evergreen neem tree with high air-purification and microclimate cooling index.',
    plantingDate: new Date('2008-07-20'),
  },
  {
    type: 'tree',
    name: 'Roadside Neem #04',
    species: 'Azadirachta indica (Neem)',
    age: 12,
    healthStatus: 'Diseased',
    location: { lat: 28.6280, lng: 77.2210 },
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'],
    description: 'Exhibiting leaf spot fungal distress and branch dieback along eastern canopy quadrant.',
    plantingDate: new Date('2014-04-10'),
  },
  {
    type: 'tree',
    name: 'Royal Flame Gulmohar #05',
    species: 'Delonix regia (Gulmohar)',
    age: 15,
    healthStatus: 'Healthy',
    location: { lat: 28.6320, lng: 77.2150 },
    images: ['https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800'],
    description: 'Vibrant scarlet blooming ornamental canopy tree along the central avenue.',
    plantingDate: new Date('2011-05-22'),
  },
  {
    type: 'tree',
    name: 'Azure Jacaranda #06',
    species: 'Jacaranda mimosifolia (Jacaranda)',
    age: 9,
    healthStatus: 'Healthy',
    location: { lat: 28.6050, lng: 77.2100 },
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    description: 'Sub-tropical ornamental tree renowned for intense violet bell-shaped blossoms.',
    plantingDate: new Date('2017-09-12'),
  },
  {
    type: 'tree',
    name: 'Golden Shower Amaltas #07',
    species: 'Cassia fistula (Amaltas)',
    age: 14,
    healthStatus: 'Healthy',
    location: { lat: 28.6180, lng: 77.2340 },
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
    description: 'Indigenous flowering specimen producing pendulous clusters of aromatic golden-yellow flowers.',
    plantingDate: new Date('2012-03-30'),
  },
  {
    type: 'tree',
    name: 'Riverside Arjun #08',
    species: 'Terminalia arjuna (Arjun)',
    age: 25,
    healthStatus: 'Healthy',
    location: { lat: 28.6100, lng: 77.2450 },
    images: ['https://images.unsplash.com/photo-1511497584788-87676104235f?w=800'],
    description: 'Buttressed trunk riverbank species aiding riparian soil stabilization and water table retention.',
    plantingDate: new Date('2001-08-10'),
  },
  {
    type: 'tree',
    name: 'White Teak specimen #09',
    species: 'Gmelina arborea (White Teak)',
    age: 20,
    healthStatus: 'Diseased',
    location: { lat: 28.6400, lng: 77.2050 },
    images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800'],
    description: 'Fast-growing deciduous species suffering from bark borer infestation on lower trunk.',
    plantingDate: new Date('2006-10-05'),
  },
  {
    type: 'tree',
    name: 'Sacred Sita Ashoka #10',
    species: 'Saraca asoca (Ashoka)',
    age: 7,
    healthStatus: 'Healthy',
    location: { lat: 28.6170, lng: 77.2250 },
    images: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800'],
    description: 'Rainforest evergreen tree with vibrant orange-yellow inflorescences planted in memorial grove.',
    plantingDate: new Date('2019-11-01'),
  },
  {
    type: 'tree',
    name: 'Desiccated Indian Rosewood #11',
    species: 'Dalbergia sissoo (Sheesham)',
    age: 30,
    healthStatus: 'Dead',
    location: { lat: 28.6020, lng: 77.2200 },
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'],
    description: 'Dead standing timber requiring controlled removal to prevent safety hazard to road traffic.',
    plantingDate: new Date('1996-02-14'),
  },
  {
    type: 'tree',
    name: 'Yellow Copperpod #12',
    species: 'Peltophorum pterocarpum (Copperpod)',
    age: 11,
    healthStatus: 'Healthy',
    location: { lat: 28.6350, lng: 77.2280 },
    images: ['https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800'],
    description: 'Sturdy wind-resistant canopy providing dense shade over public transit stop.',
    plantingDate: new Date('2015-06-18'),
  },
  {
    type: 'tree',
    name: 'Evergreen Silver Oak #13',
    species: 'Grevillea robusta (Silver Oak)',
    age: 16,
    healthStatus: 'Healthy',
    location: { lat: 28.6220, lng: 77.2010 },
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800'],
    description: 'Tall pyramidal evergreen with distinctive silver-underside pinnate foliage.',
    plantingDate: new Date('2010-07-04'),
  },
  {
    type: 'tree',
    name: 'Ancient Mahua Specimen #14',
    species: 'Madhuca longifolia (Mahua)',
    age: 42,
    healthStatus: 'Healthy',
    location: { lat: 28.6090, lng: 77.2130 },
    images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800'],
    description: 'Culturally significant ecological tree producing nectar-rich flowers supporting native pollinators.',
    plantingDate: new Date('1984-01-26'),
  },
  {
    type: 'tree',
    name: 'Red Silk Cotton Semal #15',
    species: 'Bombax ceiba (Semal)',
    age: 22,
    healthStatus: 'Diseased',
    location: { lat: 28.6260, lng: 77.2390 },
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'],
    description: 'Large thorny trunk tree showing signs of root rot due to municipal drainage overflow.',
    plantingDate: new Date('2004-09-09'),
  },
];

const parksData = [
  {
    type: 'park',
    name: 'Central Botanical Gardens & Urban Park',
    healthStatus: 'Excellent',
    area: 120000, // 120,000 sq meters
    location: { lat: 28.6139, lng: 77.2090 },
    images: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    description: 'Premier urban green lung featuring historic arboretum, herb gardens, solar water fountains, and interactive eco-learning trails.',
  },
  {
    type: 'park',
    name: 'Yamuna Riverfront Biodiversity Park',
    healthStatus: 'Good',
    area: 350000, // 350,000 sq meters
    location: { lat: 28.6450, lng: 77.2510 },
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'],
    description: 'Wetland park ecosystem with restored native marshes, migratory waterfowl bird blinds, and riparian nature walks.',
  },
  {
    type: 'park',
    name: 'Eco Serenity Community Park',
    healthStatus: 'Good',
    area: 450000, // 45,000 sq meters
    location: { lat: 28.5980, lng: 77.2150 },
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800'],
    description: 'Neighborhood community green space with open grass amphitheater, butterfly garden, and children play meadow.',
  },
];

const urbanForestsData = [
  {
    type: 'urban_forest',
    name: 'Northern Ridge Urban Biosphere Reserve',
    healthStatus: 'Excellent',
    area: 850000, // 850,000 sq meters
    location: { lat: 28.6850, lng: 77.2100 },
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'],
    description: 'Dense deciduous and thorny scrub forest reserve sustaining over 180 species of birds and rich wildlife biodiversity.',
  },
  {
    type: 'urban_forest',
    name: 'Southern Ridge Eco Sanctuary',
    healthStatus: 'Good',
    area: 620000, // 620,000 sq meters
    location: { lat: 28.5200, lng: 77.1800 },
    images: ['https://images.unsplash.com/photo-1511497584788-87676104235f?w=800'],
    description: 'Critical urban forest buffer mitigating city heat island effects, equipped with solar micro-weather sensor towers.',
  },
];

const greenBeltsData = [
  {
    type: 'green_belt',
    name: 'Outer Ring Road Linear Eco Buffer',
    healthStatus: 'Good',
    area: 180000, // 180,000 sq meters
    location: { lat: 28.6500, lng: 77.1600 },
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    description: 'Multi-tiered acoustic and particulate pollution mitigation tree corridor buffering residential zones from expressway traffic.',
  },
  {
    type: 'green_belt',
    name: 'Metro Transit Green Corridor',
    healthStatus: 'Fair',
    area: 95000, // 95,000 sq meters
    location: { lat: 28.6300, lng: 77.2200 },
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
    description: 'Continuous median vegetated strip with drought-tolerant shrubs and drip irrigation lines.',
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
        name: 'Urban Green Admin',
        email: 'admin@citygreen.gov',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('[Seed] Created default admin user.');
    }

    let citizenUser = await User.findOne({ email: 'citizen@citygreen.gov' });
    if (!citizenUser) {
      citizenUser = await User.create({
        name: 'Green Citizen',
        email: 'citizen@citygreen.gov',
        password: 'Citizen@123',
        role: 'citizen',
      });
      console.log('[Seed] Created default citizen user for reporting.');
    }

    // 1. Seed Assets (Trees, Parks, Urban Forests, Green Belts)
    console.log('[Seed] Inserting 15 trees...');
    const createdTrees = await Asset.insertMany(treesData);

    console.log('[Seed] Inserting 3 parks...');
    const createdParks = await Asset.insertMany(parksData);

    console.log('[Seed] Inserting 2 urban forests...');
    const createdForests = await Asset.insertMany(urbanForestsData);

    console.log('[Seed] Inserting 2 green belts...');
    const createdGreenBelts = await Asset.insertMany(greenBeltsData);

    const totalAssets = createdTrees.length + createdParks.length + createdForests.length + createdGreenBelts.length;
    console.log(`[Seed] Total Assets inserted: ${totalAssets}`);

    // 2. Seed 5 Maintenance Logs
    console.log('[Seed] Inserting 5 maintenance logs...');
    const maintenanceData = [
      {
        assetId: createdTrees[0]._id, // Peepal
        date: new Date('2026-08-10'),
        action: 'Canopy Trimming & Structural Pruning',
        performedBy: 'District Canopy Care Unit A',
        notes: 'Pruned dead branches encroaching on pedestrian walkway; applied organic sealant to cut surfaces.',
      },
      {
        assetId: createdTrees[3]._id, // Roadside Neem (Diseased)
        date: new Date('2026-09-02'),
        action: 'Phytosanitary Spray & Root Aeration',
        performedBy: 'Urban Plant Pathology Team',
        notes: 'Applied copper oxychloride fungicide for foliar disease; injected mycorrhizal biofertilizer into root zone.',
      },
      {
        assetId: createdParks[0]._id, // Central Botanical Park
        date: new Date('2026-08-25'),
        action: 'Drip Irrigation Telemetry Inspection',
        performedBy: 'AquaGreen Hydrotech Specialists',
        notes: 'Replaced 120m damaged micro-drip tubing in medicinal plant sector; sensor pressure calibrated to 1.8 bar.',
      },
      {
        assetId: createdGreenBelts[1]._id, // Metro Transit Green Corridor
        date: new Date('2026-09-08'),
        action: 'Soil Mulching & Weed Control',
        performedBy: 'Metro Green Line Team #4',
        notes: 'Laid 5cm organic woodchip mulch layer to reduce moisture evaporation and highway dust resuspension.',
      },
      {
        assetId: createdTrees[10]._id, // Dead Sheesham
        date: new Date('2026-09-15'),
        action: 'Arborist Risk Assessment',
        performedBy: 'Municipal Senior Arborist',
        notes: 'Confirmed 100% trunk desiccation. Scheduled crane-assisted section felling to eliminate storm falling risk.',
      },
    ];
    const createdLogs = await MaintenanceLog.insertMany(maintenanceData);
    console.log(`[Seed] Inserted ${createdLogs.length} maintenance logs.`);

    // 3. Seed 3 Citizen Reports
    console.log('[Seed] Inserting 3 citizen reports...');
    const reportsData = [
      {
        citizenId: citizenUser._id,
        assetId: createdTrees[3]._id, // Roadside Neem
        description: 'Severe yellowing and leaf loss observed on eastern branches. May require fungal inspection.',
        photo: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600',
        location: { lat: 28.6280, lng: 77.2210 },
        status: 'In Progress',
        createdAt: new Date('2026-09-01T14:30:00Z'),
      },
      {
        citizenId: citizenUser._id,
        assetId: createdParks[0]._id, // Botanical Park
        description: 'Main irrigation sprinkler near west lawn has broken nozzle causing localized water puddle.',
        photo: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600',
        location: { lat: 28.6141, lng: 77.2095 },
        status: 'Resolved',
        createdAt: new Date('2026-08-20T09:15:00Z'),
      },
      {
        citizenId: citizenUser._id,
        assetId: null, // General citizen location report
        description: 'Broken heavy branch from uncatalogued storm tree hanging dangerously over cycling track.',
        photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600',
        location: { lat: 28.6195, lng: 77.2140 },
        status: 'Pending',
        createdAt: new Date('2026-09-17T17:45:00Z'),
      },
    ];
    const createdReports = await Report.insertMany(reportsData);
    console.log(`[Seed] Inserted ${createdReports.length} citizen reports.`);

    // Verification Summary
    console.log('\n================ SEEDING VERIFICATION ================');
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

    console.log('\n[Sample Tree Record]:');
    const sampleTree = await Asset.findOne({ type: 'tree' });
    console.log({
      _id: sampleTree._id,
      type: sampleTree.type,
      name: sampleTree.name,
      species: sampleTree.species,
      healthStatus: sampleTree.healthStatus,
      location: sampleTree.location,
      age: sampleTree.age,
    });

    console.log('\n[Sample Maintenance Log with Asset populated]:');
    const sampleLog = await MaintenanceLog.findOne().populate('assetId', 'name type');
    console.log({
      _id: sampleLog._id,
      action: sampleLog.action,
      performedBy: sampleLog.performedBy,
      assetName: sampleLog.assetId?.name,
      assetType: sampleLog.assetId?.type,
    });

    console.log('\n[Sample Citizen Report with Citizen & Asset populated]:');
    const sampleReport = await Report.findOne().populate('citizenId', 'name email').populate('assetId', 'name');
    console.log({
      _id: sampleReport._id,
      status: sampleReport.status,
      description: sampleReport.description,
      reportedBy: sampleReport.citizenId?.name,
      assetName: sampleReport.assetId ? sampleReport.assetId.name : 'General Location',
    });

    console.log('\n================ SEEDING COMPLETE ================');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();
