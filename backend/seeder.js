const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Building = require('./models/Building');
const Criteria = require('./models/Criteria');
const Inspection = require('./models/Inspection');
const Issue = require('./models/Issue');
const { calculateComplianceScore } = require('./utils/complianceEngine');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await User.deleteMany();
    await Building.deleteMany();
    await Criteria.deleteMany();
    await Inspection.deleteMany();
    await Issue.deleteMany();

    console.log('👤 Seeding default users (Admin, Inspector, Maintenance)...');
    const adminUser = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'admin@swachhta.gov.in',
      password: 'Admin@123',
      role: 'ADMIN',
      department: 'Central Compliance & Estates',
      phone: '+91 98765 43210',
    });

    const inspectorUser = await User.create({
      name: 'Pooja Verma',
      email: 'inspector@swachhta.gov.in',
      password: 'Inspector@123',
      role: 'INSPECTOR',
      department: 'Environmental Audit Wing',
      phone: '+91 98111 22334',
    });

    const maintenanceUser = await User.create({
      name: 'Amit Patel',
      email: 'maintenance@swachhta.gov.in',
      password: 'Maintain@123',
      role: 'MAINTENANCE',
      department: 'Facility Management & Operations',
      phone: '+91 97222 33445',
    });

    console.log('🏛️ Seeding institutional buildings...');
    const buildingsData = [
      {
        name: 'Aryabhata Academic Block',
        code: 'AAB-01',
        block: 'Block A',
        campus: 'North Campus',
        totalFloors: 4,
        squareFootage: 65000,
        contactPerson: { name: 'Prof. S. K. Gupta', email: 'skgupta@swachhta.gov.in', phone: '+91 98333 11223' },
        zones: [
          { name: 'Ground Floor Restrooms', type: 'RESTROOM', floor: 'Ground', description: 'Dual gender public facilities' },
          { name: 'Physics & Chem Labs', type: 'LABORATORY', floor: '1st Floor', description: 'Chemical hazardous zone' },
          { name: 'Central Corridors', type: 'CORRIDOR', floor: 'All Floors', description: 'High footfall passageway' },
          { name: 'Faculty Offices', type: 'OFFICE', floor: '3rd Floor', description: 'Administrative wing' },
        ],
      },
      {
        name: 'Kalam Innovation & Research Center',
        code: 'KIRC-02',
        block: 'Block B',
        campus: 'North Campus',
        totalFloors: 6,
        squareFootage: 120000,
        contactPerson: { name: 'Dr. Ananya Ray', email: 'ananya.ray@swachhta.gov.in', phone: '+91 98444 55667' },
        zones: [
          { name: 'Solar Rooftop Grid', type: 'SOLAR_ROOFTOP', floor: 'Rooftop', description: '100kW Solar PV array' },
          { name: 'Clean Room Biotech Labs', type: 'LABORATORY', floor: '2nd Floor', description: 'High sterility zone' },
          { name: 'Cafeteria & Lounge', type: 'CAFETERIA', floor: 'Ground', description: 'Student food court' },
          { name: 'E-Waste Storage Room', type: 'WASTE_YARD', floor: 'Basement', description: 'Segregated hazardous e-waste yard' },
        ],
      },
      {
        name: 'Central Library & Media Wing',
        code: 'CLMW-03',
        block: 'Block C',
        campus: 'North Campus',
        totalFloors: 3,
        squareFootage: 48000,
        contactPerson: { name: 'R. K. Meena', email: 'meena.rk@swachhta.gov.in', phone: '+91 98555 66778' },
        zones: [
          { name: 'Main Reading Halls', type: 'COMMON_AREA', floor: 'Ground & 1st', description: 'Air-filtered quiet study area' },
          { name: 'Archive & Server Room', type: 'OFFICE', floor: '2nd Floor', description: 'HVAC precision cooled' },
          { name: 'Terrace Garden', type: 'GARDEN', floor: 'Terrace', description: 'Biophilic green zone' },
        ],
      },
      {
        name: 'Student Activity & Dining Hub',
        code: 'SADH-04',
        block: 'Block D',
        campus: 'South Campus',
        totalFloors: 2,
        squareFootage: 38000,
        contactPerson: { name: 'Vikram Sengupta', email: 'vikram.s@swachhta.gov.in', phone: '+91 98666 77889' },
        zones: [
          { name: 'Commercial Kitchen', type: 'CAFETERIA', floor: 'Ground', description: 'Wet food processing unit' },
          { name: 'Food Waste Biogas Digester', type: 'WASTE_YARD', floor: 'Rear Yard', description: 'Organic waste conversion' },
          { name: 'Dining Hall Restrooms', type: 'RESTROOM', floor: 'Ground', description: 'High frequency wet area' },
        ],
      },
      {
        name: 'Administrative Bhavan',
        code: 'ADM-05',
        block: 'Block E',
        campus: 'Main Gate',
        totalFloors: 3,
        squareFootage: 32000,
        contactPerson: { name: 'Suman Joshi', email: 'suman.j@swachhta.gov.in', phone: '+91 98777 88990' },
        zones: [
          { name: 'Council Chambers', type: 'OFFICE', floor: '1st Floor', description: 'Executive boardrooms' },
          { name: 'Public Reception & Atrium', type: 'COMMON_AREA', floor: 'Ground', description: 'Visitor intake and registration' },
        ],
      },
    ];

    const buildings = await Building.insertMany(buildingsData);

    console.log('📋 Seeding Standards & Criteria Library across 5 Swachhta/Green categories...');
    const criteriaData = [
      // Cleanliness
      {
        category: 'Cleanliness',
        title: 'Sanitization & Disinfection of High-Touch Surfaces',
        description: 'Daily documented disinfection of handrails, doorknobs, elevator panels, and desk surfaces.',
        weight: 5,
        guidance: 'Inspect logbook and test microbial swab count on key touchpoints.',
        standardReference: 'Swachh Bharat Institutional Hygiene Protocol Section 3.1',
      },
      {
        category: 'Cleanliness',
        title: 'Restroom Hygiene, Odor Control & Continuous Water Availability',
        description: 'Restrooms must be clean, odorless, stocked with eco-friendly soap, and have continuous water supply.',
        weight: 5,
        guidance: 'Check floor dry status, automated dispenser liquid level, and ventilation exhaust.',
        standardReference: 'Swachh Campus Manual Clause 4.2',
      },
      {
        category: 'Cleanliness',
        title: 'Corridor & Common Area Floor Mopping and Dust Control',
        description: 'Floors must be spotless, stain-free, and vacuumed/mopped using non-toxic cleaning detergents.',
        weight: 3,
        guidance: 'No accumulated dust along skirting boards or under stairways.',
        standardReference: 'General Facility Maintenance Standards Part B',
      },
      {
        category: 'Cleanliness',
        title: 'External Pathways & Litter-Free Surrounding Perimeter',
        description: 'All exterior pavements, garden walks, and parking aprons must be free from garbage or debris.',
        weight: 3,
        guidance: 'Observe perimeter within 25 meters of building walls.',
        standardReference: 'Swachh Survekshan Outdoor Standard',
      },

      // Waste Segregation
      {
        category: 'Waste Segregation',
        title: 'Color-Coded 3-Bin Source Waste Segregation (Green/Blue/Red)',
        description: 'Clearly labeled bins for Wet Biodegradable (Green), Dry Recyclable (Blue), and Hazardous/Sanitary (Red) at all transit points.',
        weight: 5,
        guidance: 'Audit 5 random bins to verify zero cross-contamination of food items in dry bins.',
        standardReference: 'Solid Waste Management Rules 2016 (Rule 4)',
      },
      {
        category: 'Waste Segregation',
        title: 'Safe Storage & Tracking of E-Waste and Chemical Hazards',
        description: 'Certified secure storage lockers with MSDS sheets for hazardous substances and periodic authorized recycler pickup.',
        weight: 4,
        guidance: 'Check entry log and spill containment trays.',
        standardReference: 'E-Waste (Management) Rules 2022',
      },
      {
        category: 'Waste Segregation',
        title: 'On-Site Organic Composting or Biogas Operation',
        description: 'Food and horticulture waste must be composted or fed to the on-campus biogas digester.',
        weight: 4,
        guidance: 'Inspect compost moisture level and output records.',
        standardReference: 'Zero-Waste Institutional Framework',
      },
      {
        category: 'Waste Segregation',
        title: 'Single-Use Plastic Ban Compliance & Warning Signages',
        description: 'Strict prohibition of plastic carry bags, disposable cups, and cutlery on premises with visible penalty signage.',
        weight: 3,
        guidance: 'Inspect cafeteria food packaging and bin samples.',
        standardReference: 'Plastic Waste Management Amendment Rules',
      },

      // Water Conservation
      {
        category: 'Water Conservation',
        title: 'Zero Plumbing Leaks in Taps, Flush Valves & Supply Lines',
        description: 'Immediate detection and zero dripping faucets, pressurized pipe leakage, or running flush tanks.',
        weight: 5,
        guidance: 'Inspect all plumbing risers and fixture valves under normal working pressure.',
        standardReference: 'National Building Code (NBC) 2016 Part 9',
      },
      {
        category: 'Water Conservation',
        title: 'Rainwater Harvesting (RWH) System Functionality',
        description: 'Rooftop runoff collection filters, desilting chambers, and recharge wells clear of blockages.',
        weight: 4,
        guidance: 'Inspect inlet grating and check water meter logging.',
        standardReference: 'Central Ground Water Board (CGWB) Norms',
      },
      {
        category: 'Water Conservation',
        title: 'Dual-Flush & Low-Flow Water Aerator Fixtures',
        description: 'Faucets fitted with aerators (< 4 LPM) and toilets equipped with dual-volume flush tanks.',
        weight: 3,
        guidance: 'Measure water flow rate at test fixtures.',
        standardReference: 'GRIHA v2019 Water Benchmark Criterion 10',
      },
      {
        category: 'Water Conservation',
        title: 'Treated Greywater Utilization for Landscaping & Flushing',
        description: 'STP treated effluent plumbed into irrigation sprinklers or secondary flush pipelines.',
        weight: 4,
        guidance: 'Verify BOD/COD test certificate and recycled water pipeline color coding (purple).',
        standardReference: 'CPCB Guidelines for Water Reuse',
      },

      // Energy Efficiency
      {
        category: 'Energy Efficiency',
        title: '100% LED Luminaire Transition & Daylight Harvesting',
        description: 'All internal and external illumination converted to high-efficiency LED with maximum daylight integration.',
        weight: 3,
        guidance: 'Check absence of incandescent or magnetic ballast T12/T8 fluorescent tubes.',
        standardReference: 'Energy Conservation Building Code (ECBC)',
      },
      {
        category: 'Energy Efficiency',
        title: 'Rooftop Solar PV Generation & Daily Net-Metering Tracking',
        description: 'Solar arrays clean, inverted electricity logged, and inverter efficiency > 96%.',
        weight: 4,
        guidance: 'Review monthly generation log and solar panel surface dust buildup.',
        standardReference: 'MNRE Grid Connected Solar Benchmark',
      },
      {
        category: 'Energy Efficiency',
        title: 'BEE 5-Star / Inverter Air Conditioning Set to 24°C Standard',
        description: 'Thermostats locked at 24°C or above with scheduled filter maintenance.',
        weight: 4,
        guidance: 'Random check of temperature controllers in offices and lecture halls.',
        standardReference: 'Bureau of Energy Efficiency (BEE) Directive',
      },
      {
        category: 'Energy Efficiency',
        title: 'Automated Motion Sensors in Low-Occupancy Passages & Restrooms',
        description: 'Sensors extinguish lighting and exhaust fans when rooms are vacant for > 5 minutes.',
        weight: 2,
        guidance: 'Step into unoccupied corridors to test activation lag.',
        standardReference: 'Green Campus Energy Management Code',
      },

      // Air Quality
      {
        category: 'Air Quality',
        title: 'Indoor PM2.5, PM10 & CO2 Within Safe NAAQS Limits',
        description: 'Handheld monitor reads PM2.5 < 35 µg/m³ and CO2 < 800 ppm in enclosed learning spaces.',
        weight: 5,
        guidance: 'Deploy handheld air monitor in middle of occupied rooms during peak hours.',
        standardReference: 'National Ambient Air Quality Standards (NAAQS)',
      },
      {
        category: 'Air Quality',
        title: 'Adequate Cross-Ventilation & Clean Air Conditioning Filters',
        description: 'Fresh air changes per hour (ACH) meet standard with quarterly AHU/filter cleaning logs.',
        weight: 4,
        guidance: 'Inspect AHU intake louvers and filter inspection sticker.',
        standardReference: 'ASHRAE 62.1 Indoor Air Quality Standard',
      },
      {
        category: 'Air Quality',
        title: 'Biophilic Oxygen Zones & Dedicated Indoor Purifying Flora',
        description: 'Presence of NASA-approved indoor air-purifying plants (Areca Palm, Snake Plant, Money Plant) in corridors.',
        weight: 2,
        guidance: 'Observe plant health and distribution in common lobbies.',
        standardReference: 'Green Building Biophilic Design Criterion',
      },
      {
        category: 'Air Quality',
        title: 'Zero Toxic Volatile Organic Compounds (VOC) Paint & Cleaning Chemical Policy',
        description: 'All wall finishes, coatings, and disinfectants must be certified low-VOC or GreenPro labeled.',
        weight: 3,
        guidance: 'Verify procurement certificates and safety data sheets.',
        standardReference: 'GreenPro / IGBC Green Interior Standard',
      },
    ];

    const criteria = await Criteria.insertMany(criteriaData);

    console.log('📝 Generating realistic historical inspections with dynamic compliance scoring...');

    // Inspection 1: Kalam Innovation Center (High score: ~92% EXCELLENT)
    const insp1Items = criteria.map((c, idx) => {
      let status = 'PASS';
      let remarks = 'Complies fully with Green standards.';
      if (idx === 7) {
        status = 'PARTIAL';
        remarks = 'Minor plastic bottle found in cafeteria bin; signage needs reprint.';
      }
      return {
        criteria: c._id,
        criteriaTitle: c.title,
        category: c.category,
        weight: c.weight,
        status,
        remarks,
        photoUrl: '',
      };
    });
    const score1 = calculateComplianceScore(insp1Items);
    const inspection1 = await Inspection.create({
      building: buildings[1]._id,
      inspector: inspectorUser._id,
      inspectionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      zoneName: 'Central Wing & Labs',
      generalNotes: 'Exceptional solar performance and immaculate lab hygiene.',
      items: insp1Items,
      totalWeight: score1.totalWeight,
      earnedPoints: score1.earnedPoints,
      totalScore: score1.totalScore,
      ratingKey: score1.rating.key,
      ratingLabel: score1.rating.label,
      ratingColor: score1.rating.color,
      ratingIcon: score1.rating.icon,
      categoryBreakdown: Object.entries(score1.categoryBreakdown).map(([cat, val]) => ({
        category: cat,
        ...val,
        ratingLabel: val.rating.label,
        ratingColor: val.rating.color,
      })),
      itemCounts: score1.itemCounts,
    });
    buildings[1].lastComplianceScore = score1.totalScore;
    buildings[1].lastInspectionDate = inspection1.inspectionDate;
    await buildings[1].save();

    // Inspection 2: Aryabhata Academic Block (Good score: ~81% GOOD)
    const insp2Items = criteria.map((c, idx) => {
      let status = 'PASS';
      let remarks = 'Checked and approved.';
      if (idx === 1) {
        status = 'PARTIAL';
        remarks = 'Restroom exhaust on 2nd floor noisy and weak suction.';
      } else if (idx === 4) {
        status = 'FAIL';
        remarks = 'Blue and Green bins mixed up in main corridor near staircase.';
      } else if (idx === 12) {
        status = 'PARTIAL';
        remarks = 'Two CFL bulbs remaining in storage annex; need LED swap.';
      }
      return {
        criteria: c._id,
        criteriaTitle: c.title,
        category: c.category,
        weight: c.weight,
        status,
        remarks,
        photoUrl: '',
      };
    });
    const score2 = calculateComplianceScore(insp2Items);
    const inspection2 = await Inspection.create({
      building: buildings[0]._id,
      inspector: inspectorUser._id,
      inspectionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      zoneName: 'All Floors',
      generalNotes: 'Good overall standard, minor waste segregation issue flagged for maintenance.',
      items: insp2Items,
      totalWeight: score2.totalWeight,
      earnedPoints: score2.earnedPoints,
      totalScore: score2.totalScore,
      ratingKey: score2.rating.key,
      ratingLabel: score2.rating.label,
      ratingColor: score2.rating.color,
      ratingIcon: score2.rating.icon,
      categoryBreakdown: Object.entries(score2.categoryBreakdown).map(([cat, val]) => ({
        category: cat,
        ...val,
        ratingLabel: val.rating.label,
        ratingColor: val.rating.color,
      })),
      itemCounts: score2.itemCounts,
    });
    buildings[0].lastComplianceScore = score2.totalScore;
    buildings[0].lastInspectionDate = inspection2.inspectionDate;
    await buildings[0].save();

    // Inspection 3: Student Activity & Dining Hub (Score: ~67% NEEDS IMPROVEMENT)
    const insp3Items = criteria.map((c, idx) => {
      let status = 'PASS';
      let remarks = 'Acceptable.';
      if (idx === 1) {
        status = 'FAIL';
        remarks = 'Ground floor dining washroom faucet dripping heavily and odor detected.';
      } else if (idx === 4) {
        status = 'FAIL';
        remarks = 'Kitchen wet waste mixed with single-use plastic wrappers.';
      } else if (idx === 8) {
        status = 'FAIL';
        remarks = 'Leaking valve in main kitchen dishwashing pipe line.';
      } else if (idx === 16) {
        status = 'PARTIAL';
        remarks = 'Dining hall ventilation sluggish during 1 PM lunch crowd.';
      }
      return {
        criteria: c._id,
        criteriaTitle: c.title,
        category: c.category,
        weight: c.weight,
        status,
        remarks,
        photoUrl: '',
      };
    });
    const score3 = calculateComplianceScore(insp3Items);
    const inspection3 = await Inspection.create({
      building: buildings[3]._id,
      inspector: inspectorUser._id,
      inspectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      zoneName: 'Kitchen & Dining Complex',
      generalNotes: 'Kitchen plumbing and waste segregation need urgent corrective maintenance.',
      items: insp3Items,
      totalWeight: score3.totalWeight,
      earnedPoints: score3.earnedPoints,
      totalScore: score3.totalScore,
      ratingKey: score3.rating.key,
      ratingLabel: score3.rating.label,
      ratingColor: score3.rating.color,
      ratingIcon: score3.rating.icon,
      categoryBreakdown: Object.entries(score3.categoryBreakdown).map(([cat, val]) => ({
        category: cat,
        ...val,
        ratingLabel: val.rating.label,
        ratingColor: val.rating.color,
      })),
      itemCounts: score3.itemCounts,
    });
    buildings[3].lastComplianceScore = score3.totalScore;
    buildings[3].lastInspectionDate = inspection3.inspectionDate;
    await buildings[3].save();

    // Inspection 4: Central Library (Score: ~88% GOOD)
    const insp4Items = criteria.map((c, idx) => {
      let status = 'PASS';
      let remarks = 'Meets all parameters.';
      if (idx === 10) {
        status = 'PARTIAL';
        remarks = 'Dual flush push-button on 1st floor sticking intermittently.';
      }
      return {
        criteria: c._id,
        criteriaTitle: c.title,
        category: c.category,
        weight: c.weight,
        status,
        remarks,
        photoUrl: '',
      };
    });
    const score4 = calculateComplianceScore(insp4Items);
    const inspection4 = await Inspection.create({
      building: buildings[2]._id,
      inspector: inspectorUser._id,
      inspectionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      zoneName: 'Main Library & Terrace',
      generalNotes: 'Library biophilic areas and quiet zone air filtration are top notch.',
      items: insp4Items,
      totalWeight: score4.totalWeight,
      earnedPoints: score4.earnedPoints,
      totalScore: score4.totalScore,
      ratingKey: score4.rating.key,
      ratingLabel: score4.rating.label,
      ratingColor: score4.rating.color,
      ratingIcon: score4.rating.icon,
      categoryBreakdown: Object.entries(score4.categoryBreakdown).map(([cat, val]) => ({
        category: cat,
        ...val,
        ratingLabel: val.rating.label,
        ratingColor: val.rating.color,
      })),
      itemCounts: score4.itemCounts,
    });
    buildings[2].lastComplianceScore = score4.totalScore;
    buildings[2].lastInspectionDate = inspection4.inspectionDate;
    await buildings[2].save();

    console.log('🚨 Seeding automated compliance issues & resolution workflows...');
    // Auto-create issues for Inspection 2's failed item
    const issue1 = await Issue.create({
      title: 'Non-compliance: Color-Coded 3-Bin Source Waste Segregation',
      building: buildings[0]._id,
      inspection: inspection2._id,
      criteria: criteria[4]._id,
      category: 'Waste Segregation',
      weight: 5,
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      inspectorRemarks: 'Blue and Green bins mixed up in main corridor near staircase.',
      assignedTo: maintenanceUser._id,
      assignedToName: maintenanceUser.name,
      timeline: [
        {
          status: 'OPEN',
          updatedBy: `${inspectorUser.name} (INSPECTOR)`,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          note: 'Auto-created from failed inspection item.',
        },
        {
          status: 'IN_PROGRESS',
          updatedBy: `${maintenanceUser.name} (MAINTENANCE)`,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          note: 'Housekeeping team dispatched with replacement colored bin decals and stands.',
        },
      ],
    });

    // Auto-create issues for Inspection 3's failed items
    const issue2 = await Issue.create({
      title: 'Non-compliance: Restroom Hygiene, Odor Control & Continuous Water Availability',
      building: buildings[3]._id,
      inspection: inspection3._id,
      criteria: criteria[1]._id,
      category: 'Cleanliness',
      weight: 5,
      priority: 'CRITICAL',
      status: 'OPEN',
      inspectorRemarks: 'Ground floor dining washroom faucet dripping heavily and odor detected.',
      assignedTo: maintenanceUser._id,
      assignedToName: maintenanceUser.name,
      timeline: [
        {
          status: 'OPEN',
          updatedBy: `${inspectorUser.name} (INSPECTOR)`,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          note: 'Auto-created from failed inspection item.',
        },
      ],
    });

    const issue3 = await Issue.create({
      title: 'Non-compliance: Zero Plumbing Leaks in Taps, Flush Valves & Supply Lines',
      building: buildings[3]._id,
      inspection: inspection3._id,
      criteria: criteria[8]._id,
      category: 'Water Conservation',
      weight: 5,
      priority: 'CRITICAL',
      status: 'RESOLVED',
      inspectorRemarks: 'Leaking valve in main kitchen dishwashing pipe line.',
      assignedTo: maintenanceUser._id,
      assignedToName: maintenanceUser.name,
      resolutionRemarks: 'Replaced brass ball-valve seal and re-pressurized line. Leak completely arrested.',
      resolvedAt: new Date(),
      timeline: [
        {
          status: 'OPEN',
          updatedBy: `${inspectorUser.name} (INSPECTOR)`,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          note: 'Auto-created from failed inspection item.',
        },
        {
          status: 'IN_PROGRESS',
          updatedBy: `${maintenanceUser.name} (MAINTENANCE)`,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          note: 'Plumbing contractor notified with work-order #WO-409.',
        },
        {
          status: 'RESOLVED',
          updatedBy: `${maintenanceUser.name} (MAINTENANCE)`,
          timestamp: new Date(),
          note: 'Valve replaced with heavy duty CPVC component; leak halted.',
        },
      ],
    });

    console.log('✅ Database successfully seeded!');
    console.log('------------------------------------------------------------');
    console.log('Default Credentials:');
    console.log('  👑 Admin:       admin@swachhta.gov.in       / Admin@123');
    console.log('  🔍 Inspector:   inspector@swachhta.gov.in   / Inspector@123');
    console.log('  🛠️ Maintenance: maintenance@swachhta.gov.in / Maintain@123');
    console.log('------------------------------------------------------------');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
