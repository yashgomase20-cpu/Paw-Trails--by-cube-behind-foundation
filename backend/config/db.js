const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'pawtrails.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed dataset
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
        status: 'available', // available | in-progress | adopted
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
        status: 'under_review', // pending | under_review | approved | rejected
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
        status: 'investigating', // reported | investigating | rescued | closed
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
        status: 'confirmed', // pending | confirmed | completed | cancelled
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
        status: 'unread', // unread | read | replied
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
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      this.data = initialData;
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, resetting to initial data:', err);
        const initialData = getInitialData();
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
        this.data = initialData;
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Failed to persist database:', err);
      return false;
    }
  }

  // Generic collection operations
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.save();
    }
    return this.data[name];
  }

  find(collectionName, filterFn = null) {
    const list = this.getCollection(collectionName);
    if (!filterFn) return list;
    return list.filter(filterFn);
  }

  findById(collectionName, id) {
    const list = this.getCollection(collectionName);
    return list.find(item => String(item.id) === String(id));
  }

  insert(collectionName, item) {
    const list = this.getCollection(collectionName);
    const newItem = {
      id: item.id || `${collectionName.slice(0, 3)}-${Date.now()}`,
      ...item,
      createdAt: item.createdAt || new Date().toISOString()
    };
    list.unshift(newItem);
    this.save();
    return newItem;
  }

  updateById(collectionName, id, updates) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return list[index];
  }

  deleteById(collectionName, id) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) return false;

    list.splice(index, 1);
    this.save();
    return true;
  }

  getAdmin() {
    return this.data.admin;
  }

  getStats() {
    return this.data.stats;
  }

  updateStats(newStats) {
    this.data.stats = {
      ...this.data.stats,
      ...newStats,
      lastUpdated: new Date().toISOString()
    };
    this.save();
    return this.data.stats;
  }
}

const db = new Database();
module.exports = db;
