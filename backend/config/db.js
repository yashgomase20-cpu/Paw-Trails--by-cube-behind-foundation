const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'pawtrails.json');

// Ensure data directory exists locally if writable
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Silent fail in read-only serverless environments
}

// Convert camelCase object keys to snake_case for Supabase
function camelToSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  const snake = {};
  for (const [key, val] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snake[snakeKey] = val;
  }
  return snake;
}

// Convert snake_case object keys to camelCase for JS code
function snakeToCamel(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  const camel = {};
  for (const [key, val] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camel[camelKey] = val;
  }
  return camel;
}

// Map collection names to Supabase tables
const TABLE_MAP = {
  admin: 'admin_users',
  stats: 'stats',
  animals: 'animals',
  adoptions: 'adoptions',
  reports: 'reports',
  volunteers: 'volunteers',
  contacts: 'contacts',
  donations: 'donations'
};

// Initial seed dataset (used for local fallback or when seeding Supabase)
const getInitialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const defaultAdminPassword = bcrypt.hashSync('admin123', salt);

  return {
    admin: {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@pawtrails.org',
      password: defaultAdminPassword,
      name: 'Paw Trails Administrator',
      role: 'superadmin',
      createdAt: new Date().toISOString()
    },
    stats: {
      animalsFed: 500,
      animalsRescued: 150,
      successfulAdoptions: 80,
      volunteersCount: 50,
      monthlyMealsTarget: 1000,
      sheltersActive: 12,
      lastUpdated: new Date().toISOString()
    },
    animals: [
      {
        id: 'bruno',
        name: 'Bruno',
        status: 'available',
        statusDisplay: 'Available for Adoption',
        age: '2 yrs',
        gender: 'Male',
        breed: 'Indie',
        location: 'Warje, Pune',
        image: 'images/dog-care.jpg',
        story: "Bruno was found on a busy street corner and has since grown into a friendly, energetic companion who loves people and long walks. He's healthy, vaccinated, and ready for a home that can match his playful spirit.",
        health: 'Vaccinated, Dewormed, Healthy',
        personality: 'Playful, Loving, Friendly with kids',
        rescuedDate: '2024-03-15',
        createdAt: new Date().toISOString()
      },
      {
        id: 'coco',
        name: 'Coco',
        status: 'in-progress',
        statusDisplay: 'Adoption in Progress',
        age: '1.5 yrs',
        gender: 'Female',
        breed: 'Indie',
        location: 'Kothrud, Pune',
        image: 'images/mother-puppies.jpg',
        story: "Coco is gentle and a little shy at first, but warms up quickly once she trusts you. She's currently being matched with a family who can give her the patient, loving environment she deserves.",
        health: 'Spayed, Vaccinated',
        personality: 'Gentle, Calm, Soulful',
        rescuedDate: '2024-05-20',
        createdAt: new Date().toISOString()
      },
      {
        id: 'simba',
        name: 'Simba',
        status: 'adopted',
        statusDisplay: 'Adopted',
        age: '3 yrs',
        gender: 'Male',
        breed: 'Indie',
        location: 'Baner, Pune',
        image: 'images/dog-group.jpg',
        story: 'Once a rescue in need of urgent care, Simba is now living happily with his new family. His journey from the streets to a safe home is exactly why this work matters.',
        health: 'Fully Recovered, Vaccinated',
        personality: 'Outgoing, Loyal, Energetic',
        rescuedDate: '2023-11-10',
        createdAt: new Date().toISOString()
      }
    ],
    adoptions: [
      {
        id: 'adopt-1700000001',
        fullName: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '+919876543210',
        city: 'Pune',
        animalOfInterest: 'Bruno',
        address: 'Flat 402, Green Meadows, Kothrud',
        whyAdopt: 'We have a spacious home and our family loves dogs. We want to give an indie rescue dog a forever loving home.',
        petExperience: 'Had an indie dog for 12 years previously.',
        message: 'Looking forward to meeting Bruno!',
        status: 'under_review',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    reports: [
      {
        id: 'rep-1700000001',
        fullName: 'Priya Joshi',
        phone: '+919822334455',
        email: 'priya.j@example.com',
        location: 'Near Warje Bridge, Pune',
        animalType: 'Dog',
        condition: 'Injured',
        description: 'Limping on right hind leg, seems scared but docile. Given some water.',
        image: null,
        status: 'investigating',
        adminNotes: 'Volunteer dispatched to location at 4 PM.',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    volunteers: [
      {
        id: 'vol-1700000001',
        fullName: 'Rahul Deshpande',
        phone: '+919811223344',
        email: 'rahul.d@example.com',
        city: 'Pune',
        preferredDate: '2026-11-05',
        numberOfPeople: 2,
        activity: 'Feeding Dogs',
        message: 'My friend and I would love to join Sunday feeding routes.',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    contacts: [
      {
        id: 'msg-1700000001',
        fullName: 'Meera Patel',
        email: 'meera.p@example.com',
        subject: 'Donation of dog food and medicines',
        message: 'Hello, our pet store would like to donate 50kg dry food and veterinary vitamins to your shelter.',
        status: 'unread',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    donations: [
      {
        id: 'don-1700000001',
        donorName: 'Vikram Mehta',
        email: 'vikram.m@example.com',
        phone: '+919833445566',
        amount: 2500,
        purpose: 'Medical care & Feeding',
        paymentMethod: 'UPI',
        status: 'completed',
        upiRef: 'UPI-2026-98127391',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ]
  };
};

class Database {
  constructor() {
    this.supabase = null;
    this.initSupabase();
    this.initLocal();
  }

  initSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        console.log('⚡ [DB] Connected to Supabase PostgreSQL at:', supabaseUrl);
      } catch (err) {
        console.error('⚠️ [DB] Failed to initialize Supabase client:', err.message);
        this.supabase = null;
      }
    } else {
      console.log('ℹ️ [DB] Running with local fallback data store (SUPABASE_URL not configured)');
    }
  }

  isUsingSupabase() {
    return !!this.supabase;
  }

  initLocal() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        return;
      }
    } catch (err) {
      console.warn('⚠️ [DB] Could not load pawtrails.json, using memory dataset:', err.message);
    }
    this.data = getInitialData();
    this.saveLocal();
  }

  saveLocal() {
    try {
      if (fs.existsSync(DATA_DIR)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
        return true;
      }
    } catch (err) {
      // Memory persistence only in read-only environment
    }
    return false;
  }

  getLocalCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  // Generic collection operations: find
  async find(collectionName, filterFn = null) {
    const table = TABLE_MAP[collectionName] || collectionName;

    if (this.supabase) {
      try {
        let query = this.supabase.from(table).select('*');
        if (['adoptions', 'reports', 'volunteers', 'contacts', 'donations', 'animals'].includes(table)) {
          query = query.order('created_at', { ascending: false });
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          const list = data.map(snakeToCamel);
          return filterFn ? list.filter(filterFn) : list;
        }
        if (error) {
          console.warn(`⚠️ [DB] Supabase find failed on "${table}": ${error.message}. Falling back to local data.`);
        }
      } catch (err) {
        console.warn(`⚠️ [DB] Supabase query error on "${table}":`, err.message);
      }
    }

    const list = this.getLocalCollection(collectionName);
    return filterFn ? list.filter(filterFn) : [...list];
  }

  // Generic collection operations: findById
  async findById(collectionName, id) {
    const table = TABLE_MAP[collectionName] || collectionName;

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
          .eq('id', String(id))
          .maybeSingle();

        if (!error && data) {
          return snakeToCamel(data);
        }
        if (error) {
          console.warn(`⚠️ [DB] Supabase findById failed on "${table}": ${error.message}`);
        }
      } catch (err) {
        console.warn(`⚠️ [DB] Supabase query error on "${table}":`, err.message);
      }
    }

    const list = this.getLocalCollection(collectionName);
    const found = list.find(item => String(item.id) === String(id));
    return found || null;
  }

  // Generic collection operations: insert
  async insert(collectionName, item) {
    const table = TABLE_MAP[collectionName] || collectionName;
    const newItem = {
      id: item.id || `${collectionName.slice(0, 3)}-${Date.now()}`,
      ...item,
      createdAt: item.createdAt || new Date().toISOString()
    };

    if (this.supabase) {
      try {
        const payload = camelToSnake(newItem);
        const { data, error } = await this.supabase
          .from(table)
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          return snakeToCamel(data);
        }
        if (error) {
          console.warn(`⚠️ [DB] Supabase insert failed on "${table}": ${error.message}. Writing to local store.`);
        }
      } catch (err) {
        console.warn(`⚠️ [DB] Supabase insert exception on "${table}":`, err.message);
      }
    }

    const list = this.getLocalCollection(collectionName);
    list.unshift(newItem);
    this.saveLocal();
    return newItem;
  }

  // Generic collection operations: updateById
  async updateById(collectionName, id, updates) {
    const table = TABLE_MAP[collectionName] || collectionName;
    const safeUpdates = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (this.supabase) {
      try {
        const payload = camelToSnake(safeUpdates);
        const { data, error } = await this.supabase
          .from(table)
          .update(payload)
          .eq('id', String(id))
          .select()
          .maybeSingle();

        if (!error && data) {
          return snakeToCamel(data);
        }
        if (error) {
          console.warn(`⚠️ [DB] Supabase updateById failed on "${table}": ${error.message}`);
        }
      } catch (err) {
        console.warn(`⚠️ [DB] Supabase update exception on "${table}":`, err.message);
      }
    }

    const list = this.getLocalCollection(collectionName);
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...safeUpdates
    };
    this.saveLocal();
    return list[index];
  }

  // Generic collection operations: deleteById
  async deleteById(collectionName, id) {
    const table = TABLE_MAP[collectionName] || collectionName;

    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from(table)
          .delete()
          .eq('id', String(id));

        if (!error) return true;
        console.warn(`⚠️ [DB] Supabase deleteById failed on "${table}": ${error.message}`);
      } catch (err) {
        console.warn(`⚠️ [DB] Supabase delete exception on "${table}":`, err.message);
      }
    }

    const list = this.getLocalCollection(collectionName);
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) return false;

    list.splice(index, 1);
    this.saveLocal();
    return true;
  }

  // Admin specific operations
  async getAdmin() {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('admin_users')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return snakeToCamel(data);
        }
        if (error) {
          console.warn(`⚠️ [DB] Supabase getAdmin error: ${error.message}`);
        }
      } catch (err) {
        console.warn('⚠️ [DB] Supabase getAdmin exception:', err.message);
      }
    }
    return this.data.admin;
  }

  async updateAdmin(updates) {
    const safeUpdates = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (this.supabase) {
      try {
        const payload = camelToSnake(safeUpdates);
        const { data, error } = await this.supabase
          .from('admin_users')
          .update(payload)
          .eq('id', 'admin-1')
          .select()
          .maybeSingle();

        if (!error && data) {
          return snakeToCamel(data);
        }
        if (error) {
          console.warn(`⚠️ [DB] Supabase updateAdmin failed: ${error.message}`);
        }
      } catch (err) {
        console.warn('⚠️ [DB] Supabase updateAdmin exception:', err.message);
      }
    }

    this.data.admin = {
      ...this.data.admin,
      ...safeUpdates
    };
    this.saveLocal();
    return this.data.admin;
  }

  // Impact stats specific operations
  async getStats() {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('stats')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();

        if (!error && data) {
          return snakeToCamel(data);
        }
        if (error) {
          console.warn(`⚠️ [DB] Supabase getStats error: ${error.message}`);
        }
      } catch (err) {
        console.warn('⚠️ [DB] Supabase getStats exception:', err.message);
      }
    }
    return this.data.stats;
  }

  async updateStats(newStats) {
    const safeStats = {
      ...newStats,
      lastUpdated: new Date().toISOString()
    };

    if (this.supabase) {
      try {
        const payload = camelToSnake(safeStats);
        const { data, error } = await this.supabase
          .from('stats')
          .update(payload)
          .eq('id', 'main')
          .select()
          .maybeSingle();

        if (!error && data) {
          return snakeToCamel(data);
        }
        if (error) {
          console.warn(`⚠️ [DB] Supabase updateStats error: ${error.message}`);
        }
      } catch (err) {
        console.warn('⚠️ [DB] Supabase updateStats exception:', err.message);
      }
    }

    this.data.stats = {
      ...this.data.stats,
      ...safeStats
    };
    this.saveLocal();
    return this.data.stats;
  }
}

const db = new Database();
module.exports = db;
