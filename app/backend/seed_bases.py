import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from db.mongo import client, bases, routes

# Sample base data
sample_bases = [
    {
        "id": "B_001",
        "name": "North Point",
        "servicing_address": "123 Main Rd",
        "what3words": "///track.rapid.giant",
        "drones_assigned": ["D001", "D003"],
        "routes_assigned": ["R_001_N", "R_001_S"],
        "litter_capacity_percent": 12,
        "status": "Available",
        "created_at": datetime.utcnow() - timedelta(days=30),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "B_002",
        "name": "East Hub",
        "servicing_address": "48 East Lane",
        "what3words": "///scan.path.fence",
        "drones_assigned": ["D002"],
        "routes_assigned": ["R_112_S"],
        "litter_capacity_percent": 65,
        "status": "Available",
        "created_at": datetime.utcnow() - timedelta(days=25),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "B_003",
        "name": "South Station",
        "servicing_address": "789 South Ave",
        "what3words": "///power.house.green",
        "drones_assigned": ["D004"],
        "routes_assigned": ["R_340_S"],
        "litter_capacity_percent": 93,
        "status": "Full",
        "created_at": datetime.utcnow() - timedelta(days=20),
        "updated_at": datetime.utcnow()
    }
]

# Sample route data
sample_routes = [
    {
        "id": "R_001_N",
        "name": "North Route",
        "distance": "750m",
        "base_assigned": "B_001",
        "drone_assigned": "D001",
        "mission_frequency": "Daily",
        "litter_capacity": "15 litres",
        "status": "Active",
        "created_at": datetime.utcnow() - timedelta(days=30),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "R_112_S",
        "name": "East Side Route",
        "distance": "1.2km",
        "base_assigned": "B_002",
        "drone_assigned": "D002",
        "mission_frequency": "Weekly",
        "litter_capacity": "50 litres",
        "status": "Active",
        "created_at": datetime.utcnow() - timedelta(days=25),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "R_340_S",
        "name": "South Circuit",
        "distance": "890m",
        "base_assigned": "B_003",
        "drone_assigned": "D004",
        "mission_frequency": "Bi-weekly",
        "litter_capacity": "75 litres",
        "status": "Active",
        "created_at": datetime.utcnow() - timedelta(days=20),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "R_001_S",
        "name": "North Secondary",
        "distance": "620m",
        "base_assigned": "B_001",
        "drone_assigned": None,
        "mission_frequency": "Daily",
        "litter_capacity": "15 litres",
        "status": "Inactive",
        "created_at": datetime.utcnow() - timedelta(days=15),
        "updated_at": datetime.utcnow()
    }
]

def seed_bases_and_routes():
    """Seed the bases and routes collections with sample data"""
    try:
        print("🚀 Seeding base and route data...")
        
        # Clear existing data
        bases_count = bases.count_documents({})
        routes_count = routes.count_documents({})
        
        if bases_count > 0 or routes_count > 0:
            choice = input(f"Found {bases_count} bases and {routes_count} routes. Clear them? (y/N): ")
            if choice.lower() == 'y':
                bases.delete_many({})
                routes.delete_many({})
                print(f"🗑️ Cleared existing data")
        
        # Insert sample bases
        bases_result = bases.insert_many(sample_bases)
        print(f"✅ Successfully seeded {len(bases_result.inserted_ids)} bases")
        
        # Insert sample routes  
        routes_result = routes.insert_many(sample_routes)
        print(f"✅ Successfully seeded {len(routes_result.inserted_ids)} routes")
        
        # Verify insertion
        print("📋 Seeded bases:")
        for base in sample_bases:
            print(f"   - {base['name']} ({base['id']}): {base['litter_capacity_percent']}% full")
            
        print("📋 Seeded routes:")
        for route in sample_routes:
            print(f"   - {route['name']} ({route['id']}): {route['status']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error seeding bases and routes: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up base and route database...")
    
    try:
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        if seed_bases_and_routes():
            print("\n✅ Base and route database setup completed successfully!")
        else:
            print("\n❌ Base and route database setup failed!")
            
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")