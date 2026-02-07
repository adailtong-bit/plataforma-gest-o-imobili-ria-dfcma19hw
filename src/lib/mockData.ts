// ... (imports remain same)
import {
  Property,
  // ... other imports
} from '@/lib/types'

// ... (other code)

const hotelRooms: Property[] = []
for (let i = 1; i <= 10; i++) {
  const room: Property = {
    id: `room_10${i}_h1`,
    name: `Room 10${i}`,
    address: '123 Beach Blvd',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    country: 'US',
    type: 'Hotel Room',
    profileType: 'short_term',
    community: 'Grand Plaza Hotel',
    hotelId: 'hotel_1',
    towerId: 'tower_1_h1',
    roomNumber: `10${i}`,
    status: i % 2 === 0 ? 'occupied' : 'available',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    image: 'https://img.usecurling.com/p/400/300?q=hotel%20room',
    ownerId: 'user_owner_demo',
    listingPrice: 200,
    roomCharacteristics: {
      bedType: i % 2 === 0 ? 'King' : 'Queen',
      view: i % 3 === 0 ? 'Sea View' : 'City View',
      hasBalcony: i > 5,
      maxOccupancy: 2,
      sizeSqFt: 350,
    },
    priceHistory: [
      {
        date: new Date().toISOString(), // Fixed for current date context
        price: 180,
        changedBy: 'System',
      },
    ],
    // ADDING AMENITIES MOCK DATA
    amenities: [
      'Wifi',
      'TV',
      i % 2 === 0 ? 'Minibar' : 'Coffee Machine',
      i > 5 ? 'Balcony' : 'Safe',
    ],
  }
  hotelRooms.push(room)
}

// ... (rest of the file content remains same, just ensuring hotelRooms export is updated in properties array)
export const properties: Property[] = [...generatedProperties, ...hotelRooms]
// ... (rest of exports)
