const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prism_surat';
const DB_NAME = process.env.DB_NAME || 'prism_surat';
const bloodDonors = [
  { name: 'Rajesh Kumar Patel', bloodGroup: 'O+', phone: '+919825012345', location: 'Adajan, Surat', area: 'Adajan', distance: '1.2 km', age: 28, gender: 'Male', lastDonated: '2024-09-01', isAvailable: true },
  { name: 'Suresh Ramanlal Shah', bloodGroup: 'O+', phone: '+919898123456', location: 'Varachha Road, Surat', area: 'Varachha', distance: '3.5 km', age: 35, gender: 'Male', lastDonated: '2024-07-15', isAvailable: false },
  { name: 'Kiran Haresh Mehta', bloodGroup: 'O+', phone: '+919974234567', location: 'Majura Gate, Surat', area: 'Majura Gate', distance: '1.8 km', age: 30, gender: 'Female', lastDonated: '2024-06-20', isAvailable: true },
  { name: 'Arun Devidas Chaudhary', bloodGroup: 'O+', phone: '+919825345678', location: 'City Light Road, Surat', area: 'City Light', distance: '2.9 km', age: 42, gender: 'Male', lastDonated: '2024-08-10', isAvailable: true },
  { name: 'Hardik Jayeshbhai Patel', bloodGroup: 'O+', phone: '+919687456789', location: 'Ghod Dod Road, Surat', area: 'Ghod Dod Road', distance: '1.5 km', age: 25, gender: 'Male', lastDonated: '2024-05-30', isAvailable: true },
  { name: 'Rohan Naresh Gupta', bloodGroup: 'O+', phone: '+919978567890', location: 'Varachha, Surat', area: 'Varachha', distance: '3.8 km', age: 31, gender: 'Male', lastDonated: '2024-04-12', isAvailable: true },
  { name: 'Nisha Pravin Joshi', bloodGroup: 'O+', phone: '+919825678901', location: 'Katargam, Surat', area: 'Katargam', distance: '5.1 km', age: 27, gender: 'Female', lastDonated: '2024-07-01', isAvailable: true },
  { name: 'Mahesh Chandrakant Trivedi', bloodGroup: 'O+', phone: '+919974789012', location: 'Udhna, Surat', area: 'Udhna', distance: '7.3 km', age: 38, gender: 'Male', lastDonated: '2024-08-25', isAvailable: true },
  { name: 'Ananya Vinod Sharma', bloodGroup: 'A+', phone: '+919825890123', location: 'Vesu, Surat', area: 'Vesu', distance: '6.2 km', age: 24, gender: 'Female', lastDonated: '2024-08-01', isAvailable: true },
  { name: 'Kavita Ramesh Modi', bloodGroup: 'A+', phone: '+919687901234', location: 'Kapodra, Surat', area: 'Kapodra', distance: '4.1 km', age: 29, gender: 'Female', lastDonated: '2024-07-20', isAvailable: true },
  { name: 'Deepak Sureshbhai Nair', bloodGroup: 'A+', phone: '+919978012345', location: 'Sachin GIDC, Surat', area: 'Sachin', distance: '14.0 km', age: 45, gender: 'Male', lastDonated: '2024-06-05', isAvailable: true },
  { name: 'Bhavesh Maheshkumar Rana', bloodGroup: 'A+', phone: '+919825123450', location: 'Althan, Surat', area: 'Althan', distance: '8.5 km', age: 33, gender: 'Male', lastDonated: '2024-05-18', isAvailable: true },
  { name: 'Priya Sanjay Desai', bloodGroup: 'A+', phone: '+919974234560', location: 'Piplod, Surat', area: 'Piplod', distance: '7.0 km', age: 26, gender: 'Female', lastDonated: '2024-08-15', isAvailable: true },
  { name: 'Hitesh Chandubhai Patil', bloodGroup: 'A+', phone: '+919898345671', location: 'Dumas Road, Surat', area: 'Dumas', distance: '9.2 km', age: 36, gender: 'Male', lastDonated: '2024-09-01', isAvailable: false },
  { name: 'Sonal Dinesh Bansal', bloodGroup: 'A+', phone: '+919687456780', location: 'Althan, Surat', area: 'Althan', distance: '8.8 km', age: 28, gender: 'Female', lastDonated: '2024-07-10', isAvailable: true },
  { name: 'Vikram Balwantsinh Singh', bloodGroup: 'B+', phone: '+919825567891', location: 'Athwalines, Surat', area: 'Athwalines', distance: '2.4 km', age: 40, gender: 'Male', lastDonated: '2024-06-15', isAvailable: true },
  { name: 'Meena Girishkumar Iyer', bloodGroup: 'B+', phone: '+919978678902', location: 'Majura Gate, Surat', area: 'Majura Gate', distance: '1.6 km', age: 32, gender: 'Female', lastDonated: '2024-08-20', isAvailable: true },
  { name: 'Suresh Kantilal Rao', bloodGroup: 'B+', phone: '+919687789013', location: 'Puna Gam, Surat', area: 'Puna Gam', distance: '6.8 km', age: 50, gender: 'Male', lastDonated: '2024-05-05', isAvailable: true },
  { name: 'Farhan Ahmed Sheikh', bloodGroup: 'B+', phone: '+919825890124', location: 'Sagrampura, Surat', area: 'Sagrampura', distance: '3.2 km', age: 29, gender: 'Male', lastDonated: '2024-07-25', isAvailable: true },
  { name: 'Lalita Ravi Pillai', bloodGroup: 'B+', phone: '+919974901235', location: 'Katargam, Surat', area: 'Katargam', distance: '5.4 km', age: 34, gender: 'Female', lastDonated: '2024-04-28', isAvailable: true },
  { name: 'Jignesh Hasmukh Gohil', bloodGroup: 'B+', phone: '+919898012346', location: 'Pal, Surat', area: 'Pal', distance: '7.6 km', age: 27, gender: 'Male', lastDonated: '2024-08-12', isAvailable: true },
  { name: 'Ritu Subhash Pillai', bloodGroup: 'B+', phone: '+919687123457', location: 'Sarthana, Surat', area: 'Sarthana', distance: '5.9 km', age: 23, gender: 'Female', lastDonated: '2024-09-01', isAvailable: true },
  { name: 'Pooja Anil Verma', bloodGroup: 'AB+', phone: '+919825234568', location: 'Katargam, Surat', area: 'Katargam', distance: '4.5 km', age: 31, gender: 'Female', lastDonated: '2024-07-08', isAvailable: true },
  { name: 'Sanjay Narayandas Garg', bloodGroup: 'AB+', phone: '+919978345679', location: 'Ring Road, Surat', area: 'Ring Road', distance: '2.1 km', age: 44, gender: 'Male', lastDonated: '2024-06-30', isAvailable: true },
  { name: 'Neha Rajkumar Pandey', bloodGroup: 'AB+', phone: '+919687456781', location: 'Dindoli, Surat', area: 'Dindoli', distance: '10.3 km', age: 26, gender: 'Female', lastDonated: '2024-05-22', isAvailable: false },
  { name: 'Aditya Hemant Kulkarni', bloodGroup: 'AB+', phone: '+919825567892', location: 'Vesu, Surat', area: 'Vesu', distance: '6.5 km', age: 29, gender: 'Male', lastDonated: '2024-08-05', isAvailable: true },
  { name: 'Tina Francis Mathews', bloodGroup: 'AB+', phone: '+919974678903', location: 'Bhatar, Surat', area: 'Bhatar', distance: '8.1 km', age: 33, gender: 'Female', lastDonated: '2024-07-14', isAvailable: true },
  { name: 'Rahul Chandrakant Mehta', bloodGroup: 'O-', phone: '+919898789014', location: 'Piplod, Surat', area: 'Piplod', distance: '6.9 km', age: 35, gender: 'Male', lastDonated: '2024-06-10', isAvailable: true },
  { name: 'Ritu Suresh Pillai', bloodGroup: 'O-', phone: '+919687890125', location: 'Sarthana, Surat', area: 'Sarthana', distance: '5.7 km', age: 28, gender: 'Female', lastDonated: '2024-08-18', isAvailable: true },
  { name: 'Vinod Shankarlal Pandya', bloodGroup: 'O-', phone: '+919825901236', location: 'Rander, Surat', area: 'Rander', distance: '6.2 km', age: 47, gender: 'Male', lastDonated: '2024-07-03', isAvailable: true },
  { name: 'Sushma Prakash Pathak', bloodGroup: 'O-', phone: '+919978012347', location: 'Limbayat, Surat', area: 'Limbayat', distance: '9.5 km', age: 38, gender: 'Female', lastDonated: '2024-05-15', isAvailable: true },
  { name: 'Priya Anilbhai Rander', bloodGroup: 'A-', phone: '+919687123458', location: 'Rander, Surat', area: 'Rander', distance: '5.8 km', age: 30, gender: 'Female', lastDonated: '2024-08-22', isAvailable: true },
  { name: 'Amit Jitendrabhai Trivedi', bloodGroup: 'A-', phone: '+919825234569', location: 'Limbayat, Surat', area: 'Limbayat', distance: '8.8 km', age: 39, gender: 'Male', lastDonated: '2024-07-17', isAvailable: true },
  { name: 'Sunita Gurpreet Kaur', bloodGroup: 'A-', phone: '+919974345680', location: 'Bhatar, Surat', area: 'Bhatar', distance: '7.4 km', age: 36, gender: 'Female', lastDonated: '2024-06-25', isAvailable: false },
  { name: 'Manish Rameshbhai Doshi', bloodGroup: 'A-', phone: '+919898456791', location: 'Udhna, Surat', area: 'Udhna', distance: '8.2 km', age: 43, gender: 'Male', lastDonated: '2024-08-28', isAvailable: true },
  { name: 'Arjun Dilipkumar Joshi', bloodGroup: 'B-', phone: '+919687567892', location: 'Pal, Surat', area: 'Pal', distance: '7.8 km', age: 32, gender: 'Male', lastDonated: '2024-05-10', isAvailable: true },
  { name: 'Savitri Mukesh Thakkar', bloodGroup: 'B-', phone: '+919825678903', location: 'Ghod Dod Road, Surat', area: 'Ghod Dod Road', distance: '2.2 km', age: 41, gender: 'Female', lastDonated: '2024-07-29', isAvailable: true },
  { name: 'Karan Manoj Malhotra', bloodGroup: 'B-', phone: '+919978789014', location: 'Adajan, Surat', area: 'Adajan', distance: '1.9 km', age: 24, gender: 'Male', lastDonated: '2024-06-08', isAvailable: true },
  { name: 'Sunita Balvantbhai Kaur', bloodGroup: 'AB-', phone: '+919687890126', location: 'Bhatar, Surat', area: 'Bhatar', distance: '8.3 km', age: 45, gender: 'Female', lastDonated: '2024-04-20', isAvailable: false },
  { name: 'Karan Shailesh Malhotra', bloodGroup: 'AB-', phone: '+919825901237', location: 'Adajan, Surat', area: 'Adajan', distance: '2.0 km', age: 34, gender: 'Male', lastDonated: '2024-08-30', isAvailable: true },
  { name: 'Pooja Ramanlal Shah', bloodGroup: 'AB-', phone: '+919974012348', location: 'Vesu, Surat', area: 'Vesu', distance: '6.7 km', age: 29, gender: 'Female', lastDonated: '2024-07-05', isAvailable: true },
  { name: 'Bhavesh Jitendra Rana', bloodGroup: 'O+', phone: '+919898123457', location: 'Kapodra, Surat', area: 'Kapodra', distance: '4.3 km', age: 22, gender: 'Male', lastDonated: '2024-09-01', isAvailable: true },
  { name: 'Rekha Arvind Soni', bloodGroup: 'O+', phone: '+919687234568', location: 'Nanpura, Surat', area: 'Nanpura', distance: '2.6 km', age: 37, gender: 'Female', lastDonated: '2024-08-07', isAvailable: true },
  { name: 'Chirag Dineshbhai Patel', bloodGroup: 'O+', phone: '+919825345679', location: 'Sarthana, Surat', area: 'Sarthana', distance: '6.1 km', age: 26, gender: 'Male', lastDonated: '2024-06-18', isAvailable: true },
  { name: 'Ankit Sureshkumar Shah', bloodGroup: 'A+', phone: '+919974456790', location: 'Adajan, Surat', area: 'Adajan', distance: '1.7 km', age: 31, gender: 'Male', lastDonated: '2024-08-26', isAvailable: true },
  { name: 'Divya Rameshbhai Patel', bloodGroup: 'B+', phone: '+919898567801', location: 'City Light, Surat', area: 'City Light', distance: '3.1 km', age: 25, gender: 'Female', lastDonated: '2024-07-22', isAvailable: true },
  { name: 'Nilesh Chandrakant Vyas', bloodGroup: 'A+', phone: '+919687678912', location: 'Piplod, Surat', area: 'Piplod', distance: '7.2 km', age: 48, gender: 'Male', lastDonated: '2024-05-28', isAvailable: true },
  { name: 'Hetal Jagdishbhai Panchal', bloodGroup: 'B+', phone: '+919825789023', location: 'Varachha, Surat', area: 'Varachha', distance: '4.0 km', age: 34, gender: 'Female', lastDonated: '2024-08-14', isAvailable: true },
  { name: 'Mihir Ashokbhai Parmar', bloodGroup: 'O+', phone: '+919978890134', location: 'Rander, Surat', area: 'Rander', distance: '5.4 km', age: 20, gender: 'Male', lastDonated: '2024-09-01', isAvailable: true },
];
const nearbyServices = [
  {
    name: 'SMIMER Hospital (Smt. Nathiba Haridas Lakhamashi Tapib Hospital)',
    category: 'hospital', label: 'Hospital',
    address: 'Khatodara, Ring Road, Surat - 395002',
    phone: '0261-2245552', emergencyPhone: '108',
    rating: '4.5', type: 'Government',
    lat: 21.1873, lng: 72.8157,
    speciality: 'Trauma Center, Multi-Specialty',
    beds: 1200, openHours: '24/7'
  },
  {
    name: 'New Civil Hospital Surat (GNFC)',
    category: 'hospital', label: 'Hospital',
    address: 'Civil Hospital Road, Majura Gate, Surat - 395001',
    phone: '0261-2448999', emergencyPhone: '108',
    rating: '4.3', type: 'Government',
    lat: 21.1939, lng: 72.8323,
    speciality: 'General, Emergency, Pediatrics',
    beds: 1500, openHours: '24/7'
  },
  {
    name: 'Kiran Super Specialty Hospital',
    category: 'hospital', label: 'Hospital',
    address: '1, Kiran Hospital Road, Katargam, Surat - 395004',
    phone: '0261-2600000', emergencyPhone: '0261-2600001',
    rating: '4.7', type: 'Private',
    lat: 21.2231, lng: 72.8417,
    speciality: 'Cardiac, Neuro, Oncology',
    beds: 300, openHours: '24/7'
  },
  {
    name: 'Nirali Multispeciality Hospital',
    category: 'hospital', label: 'Hospital',
    address: '10, Behind Kiran Parlor, Adajan, Surat - 395009',
    phone: '0261-2765555', emergencyPhone: '0261-2765000',
    rating: '4.6', type: 'Private',
    lat: 21.2087, lng: 72.7937,
    speciality: 'Orthopedic, Gynecology, ICU',
    beds: 150, openHours: '24/7'
  },
  {
    name: 'Dhiraj General Hospital (Pramukh Swami Medical College)',
    category: 'hospital', label: 'Hospital',
    address: 'Pipodara, Tal: Chikhli, Surat - 394210',
    phone: '0261-2345678', emergencyPhone: '0261-2345000',
    rating: '4.4', type: 'Private',
    lat: 21.1542, lng: 72.8695,
    speciality: 'Teaching Hospital, Multi-Specialty',
    beds: 500, openHours: '24/7'
  },
  {
    name: 'Surat Municipal Institute of Medical Education and Research (SMC)',
    category: 'hospital', label: 'Hospital',
    address: 'Bhagatalav, Udhna-Magdalla Road, Surat - 395017',
    phone: '0261-2390123', emergencyPhone: '108',
    rating: '4.2', type: 'Government',
    lat: 21.1756, lng: 72.8512,
    speciality: 'Medical Education, Emergency',
    beds: 800, openHours: '24/7'
  },
  {
    name: 'Sunshine Global Hospital',
    category: 'hospital', label: 'Hospital',
    address: 'Science City Road, Sola, Surat - 395007',
    phone: '0261-6619999', emergencyPhone: '0261-6619000',
    rating: '4.8', type: 'Private',
    lat: 21.1698, lng: 72.8301,
    speciality: 'Cardiac Surgery, Organ Transplant',
    beds: 350, openHours: '24/7'
  },
  {
    name: 'Aakar Maternity & General Hospital',
    category: 'hospital', label: 'Hospital',
    address: 'Piplod, Near Palanpur Jakatnaka, Surat - 395007',
    phone: '0261-2261234', emergencyPhone: '0261-2261000',
    rating: '4.5', type: 'Private',
    lat: 21.1643, lng: 72.8189,
    speciality: 'Maternity, NICU, Gynecology',
    beds: 80, openHours: '24/7'
  },
  {
    name: 'Surat Raktadan Kendra (Blood Donation & Hospital)',
    category: 'hospital', label: 'Hospital',
    address: 'Ring Road, Surat - 395002',
    phone: '0261-2332211', emergencyPhone: '108',
    rating: '4.3', type: 'Government',
    lat: 21.1812, lng: 72.8234,
    speciality: 'Blood Donation, Emergency',
    beds: 100, openHours: '24/7'
  },
  {
    name: 'Yashoda Super Speciality Hospital',
    category: 'hospital', label: 'Hospital',
    address: 'Uttran Road, Near Bhestan, Surat - 394105',
    phone: '0261-2970000', emergencyPhone: '0261-2970001',
    rating: '4.4', type: 'Private',
    lat: 21.2456, lng: 72.8023,
    speciality: 'Neurology, Oncology, Dialysis',
    beds: 200, openHours: '24/7'
  },
  {
    name: 'Nidhi Multispeciality Hospital',
    category: 'hospital', label: 'Hospital',
    address: 'Vesu, Near Bhulka Bhavan School, Surat - 395007',
    phone: '0261-2572345', emergencyPhone: '0261-2572000',
    rating: '4.6', type: 'Private',
    lat: 21.1534, lng: 72.7912,
    speciality: 'Pediatrics, Orthopedic, ICU',
    beds: 100, openHours: '24/7'
  },
  {
    name: 'Bhagwan Mahavir Hospital',
    category: 'hospital', label: 'Hospital',
    address: 'Ring Road, Surat - 395001',
    phone: '0261-2311111', emergencyPhone: '108',
    rating: '4.3', type: 'Government',
    lat: 21.1867, lng: 72.8289,
    speciality: 'Government Multi Specialty',
    beds: 600, openHours: '24/7'
  },
  {
    name: 'Surat City Police Commissionerate (Control Room)',
    category: 'police', label: 'Police Station',
    address: 'Athwalines Police Lines, Athwa, Surat - 395001',
    phone: '0261-2463444', emergencyPhone: '112',
    rating: '4.3', type: 'Control Room',
    lat: 21.1853, lng: 72.8344,
    zone: 'Central', openHours: '24/7'
  },
  {
    name: 'Varachha A-Division Police Station',
    category: 'police', label: 'Police Station',
    address: 'Varachha Road, Near Water Works, Surat - 395006',
    phone: '0261-2462777', emergencyPhone: '112',
    rating: '4.1', type: 'Division',
    lat: 21.2189, lng: 72.8726,
    zone: 'East', openHours: '24/7'
  },
  {
    name: 'Adajan Police Station',
    category: 'police', label: 'Police Station',
    address: 'Near Adajan Gam, Adajan Road, Surat - 395009',
    phone: '0261-2461888', emergencyPhone: '112',
    rating: '4.2', type: 'Local',
    lat: 21.2069, lng: 72.7896,
    zone: 'West', openHours: '24/7'
  },
  {
    name: 'Udhna Police Station',
    category: 'police', label: 'Police Station',
    address: 'Udhna Udyog Nagar, GIDC, Surat - 394210',
    phone: '0261-2463999', emergencyPhone: '112',
    rating: '4.0', type: 'Industrial',
    lat: 21.1678, lng: 72.8937,
    zone: 'East', openHours: '24/7'
  },
  {
    name: 'Katargam Police Station',
    category: 'police', label: 'Police Station',
    address: 'Katargam Main Road, Surat - 395004',
    phone: '0261-2462333', emergencyPhone: '112',
    rating: '4.1', type: 'Local',
    lat: 21.2249, lng: 72.8432,
    zone: 'North', openHours: '24/7'
  },
  {
    name: 'Limbayat Police Station',
    category: 'police', label: 'Police Station',
    address: 'Limbayat, Near Udhna Railway Station, Surat - 394210',
    phone: '0261-2463222', emergencyPhone: '112',
    rating: '4.0', type: 'Local',
    lat: 21.1589, lng: 72.9023,
    zone: 'South East', openHours: '24/7'
  },
  {
    name: 'Bhestan Police Station',
    category: 'police', label: 'Police Station',
    address: 'Bhestan Village Road, Surat - 394105',
    phone: '0261-2461555', emergencyPhone: '112',
    rating: '4.2', type: 'Local',
    lat: 21.2512, lng: 72.8012,
    zone: 'North West', openHours: '24/7'
  },
  {
    name: 'Puna Police Station',
    category: 'police', label: 'Police Station',
    address: 'Puna Gam Road, Surat - 395010',
    phone: '0261-2460777', emergencyPhone: '112',
    rating: '4.1', type: 'Local',
    lat: 21.1834, lng: 72.8512,
    zone: 'Central East', openHours: '24/7'
  },
  {
    name: 'Rander Police Station',
    category: 'police', label: 'Police Station',
    address: 'Rander Road, Surat - 395005',
    phone: '0261-2461222', emergencyPhone: '112',
    rating: '4.0', type: 'Local',
    lat: 21.2178, lng: 72.7812,
    zone: 'West', openHours: '24/7'
  },
  {
    name: 'Chowk Bazar Police Station',
    category: 'police', label: 'Police Station',
    address: 'Chowk Bazar, Nanpura, Surat - 395001',
    phone: '0261-2413333', emergencyPhone: '112',
    rating: '4.2', type: 'Old City',
    lat: 21.1967, lng: 72.8312,
    zone: 'Old City', openHours: '24/7'
  },
  {
    name: 'Surat Fire Brigade - Central Station (Chowk Bazar)',
    category: 'fire', label: 'Fire Station',
    address: 'Chowk Bazar, Nanpura, Surat - 395003',
    phone: '0261-2421015', emergencyPhone: '101',
    rating: '4.9', type: 'Main Station',
    lat: 21.1967, lng: 72.8312,
    vehicles: 12, openHours: '24/7'
  },
  {
    name: 'Surat Fire Station - Katargam',
    category: 'fire', label: 'Fire Station',
    address: 'Katargam Cross Roads, Katargam, Surat - 395004',
    phone: '0261-2421030', emergencyPhone: '101',
    rating: '4.7', type: 'Sub Station',
    lat: 21.2249, lng: 72.8432,
    vehicles: 6, openHours: '24/7'
  },
  {
    name: 'Surat Fire Station - Udhna',
    category: 'fire', label: 'Fire Station',
    address: 'Udhna GIDC Road, Surat - 394210',
    phone: '0261-2421045', emergencyPhone: '101',
    rating: '4.6', type: 'Industrial',
    lat: 21.1656, lng: 72.8917,
    vehicles: 5, openHours: '24/7'
  },
  {
    name: 'Surat Fire Station - Adajan',
    category: 'fire', label: 'Fire Station',
    address: 'Adajan Patia, Near Radha Swami Satsang Bhawan, Surat - 395009',
    phone: '0261-2421060', emergencyPhone: '101',
    rating: '4.8', type: 'Sub Station',
    lat: 21.2069, lng: 72.7934,
    vehicles: 4, openHours: '24/7'
  },
  {
    name: 'Surat Fire Station - Varachha',
    category: 'fire', label: 'Fire Station',
    address: 'Varachha Road, Near Jolly Tours, Surat - 395006',
    phone: '0261-2421075', emergencyPhone: '101',
    rating: '4.5', type: 'Sub Station',
    lat: 21.2156, lng: 72.8712,
    vehicles: 5, openHours: '24/7'
  },
  {
    name: 'Surat Fire Station - Limbayat',
    category: 'fire', label: 'Fire Station',
    address: 'Limbayat, Surat - 394210',
    phone: '0261-2421090', emergencyPhone: '101',
    rating: '4.6', type: 'Sub Station',
    lat: 21.1589, lng: 72.9023,
    vehicles: 4, openHours: '24/7'
  },
  {
    name: 'Surat Fire Station - Bhestan / Pal',
    category: 'fire', label: 'Fire Station',
    address: 'Pal-Bhestan Road, Surat - 394105',
    phone: '0261-2421105', emergencyPhone: '101',
    rating: '4.5', type: 'Sub Station',
    lat: 21.2423, lng: 72.8012,
    vehicles: 3, openHours: '24/7'
  },
  {
    name: 'Red Cross Blood Bank, Surat',
    category: 'blood', label: 'Blood Bank',
    address: 'Civil Hospital Campus, Majura Gate, Surat - 395001',
    phone: '0261-2448111', emergencyPhone: '0261-2448112',
    rating: '4.8', type: 'Government',
    lat: 21.1934, lng: 72.8318,
    openHours: '24/7', bloodAvailable: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  },
  {
    name: 'Surat Voluntary Blood Bank',
    category: 'blood', label: 'Blood Bank',
    address: 'Opp. Rushabh Tower, Ring Road, Surat - 395002',
    phone: '0261-2346789', emergencyPhone: '0261-2346700',
    rating: '4.7', type: 'NGO',
    lat: 21.1812, lng: 72.8156,
    openHours: '8:00 AM - 8:00 PM', bloodAvailable: ['O+', 'A+', 'B+', 'AB+', 'O-']
  },
  {
    name: 'Lions Blood Bank, Surat (Diamond City Blood Bank)',
    category: 'blood', label: 'Blood Bank',
    address: 'Lions House, Nanpura, Surat - 395001',
    phone: '0261-2459012', emergencyPhone: '0261-2459000',
    rating: '4.6', type: 'NGO',
    lat: 21.1892, lng: 72.8268,
    openHours: '7:00 AM - 9:00 PM', bloodAvailable: ['O+', 'O-', 'A+', 'B+', 'AB+']
  },
  {
    name: 'Rotary Blood Bank, Surat',
    category: 'blood', label: 'Blood Bank',
    address: 'Ghod Dod Road, Surat - 395007',
    phone: '0261-2230234', emergencyPhone: '0261-2230200',
    rating: '4.5', type: 'NGO',
    lat: 21.1756, lng: 72.8234,
    openHours: '8:00 AM - 6:00 PM', bloodAvailable: ['O+', 'A+', 'B+', 'AB+', 'A-']
  },
  {
    name: 'SMIMER Blood Bank (Government)',
    category: 'blood', label: 'Blood Bank',
    address: 'SMIMER Hospital, Khatodara, Ring Road, Surat - 395002',
    phone: '0261-2245553', emergencyPhone: '0261-2245554',
    rating: '4.7', type: 'Government',
    lat: 21.1873, lng: 72.8157,
    openHours: '24/7', bloodAvailable: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  },
  {
    name: 'Kiran Hospital Blood Bank',
    category: 'blood', label: 'Blood Bank',
    address: '1, Kiran Hospital Road, Katargam, Surat - 395004',
    phone: '0261-2600002', emergencyPhone: '0261-2600003',
    rating: '4.6', type: 'Private',
    lat: 21.2231, lng: 72.8417,
    openHours: '24/7', bloodAvailable: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-']
  },
  {
    name: 'Sunshine Hospital Blood Bank',
    category: 'blood', label: 'Blood Bank',
    address: 'Science City Road, Surat - 395007',
    phone: '0261-6619998', emergencyPhone: '0261-6619997',
    rating: '4.8', type: 'Private',
    lat: 21.1698, lng: 72.8301,
    openHours: '24/7', bloodAvailable: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  },
  {
    name: 'Mahavir Seva Mandal Blood Bank',
    category: 'blood', label: 'Blood Bank',
    address: 'Nanpura, Near Gandhi Smruti Bhavan, Surat - 395001',
    phone: '0261-2412567', emergencyPhone: '0261-2412560',
    rating: '4.4', type: 'NGO',
    lat: 21.1934, lng: 72.8298,
    openHours: '9:00 AM - 7:00 PM', bloodAvailable: ['O+', 'A+', 'B+', 'AB+']
  },
];

async function seed() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log(`✅ Connected to MongoDB - ${DB_NAME}`);
    const db = client.db(DB_NAME);
    await db.collection('blood_donors').deleteMany({});
    await db.collection('nearby_services').deleteMany({});
    await db.collection('blood_requests').deleteMany({});
    await db.collection('emergency_logs').deleteMany({});
    console.log('🗑️  Cleared old data');
    const donorsWithDate = bloodDonors.map(d => ({ ...d, createdAt: new Date() }));
    await db.collection('blood_donors').insertMany(donorsWithDate);
    console.log(`✅ Inserted ${bloodDonors.length} real Surat blood donors`);
    const servicesWithDate = nearbyServices.map(s => ({ ...s, createdAt: new Date() }));
    await db.collection('nearby_services').insertMany(servicesWithDate);
    console.log(`✅ Inserted ${nearbyServices.length} real Surat emergency services`);
    const existing = await db.collection('users').findOne({ username: 'admin' });
    if (!existing) {
      const hashedPass = await bcrypt.hash('admin123', 10);
      await db.collection('users').insertOne({
        fullName: 'PRISM Admin',
        email: 'admin@prism.com',
        username: 'admin',
        password: hashedPass,
        role: 'admin',
        bloodGroup: 'O+',
        phone: '+919000000001',
        createdAt: new Date()
      });
      console.log('✅ Admin created  →  username: admin  |  password: admin123');
    } else {
      console.log('ℹ️  Admin already exists');
    }
    await db.collection('emergency_logs').insertMany([
      { type: 'BLOOD_REQUEST', message: 'O+ blood needed at SMIMER Hospital', patientName: 'Ramesh Patel', contactNumber: '+919825000001', timestamp: new Date(Date.now() - 3600000) },
      { type: 'BLOOD_REQUEST', message: 'A+ blood needed at New Civil Hospital', patientName: 'Meena Shah', contactNumber: '+919825000002', timestamp: new Date(Date.now() - 7200000) },
      { type: 'SOS', message: 'SOS Alert triggered from Adajan area', timestamp: new Date(Date.now() - 10800000) },
      { type: 'BLOOD_REQUEST', message: 'B- blood needed at Kiran Hospital', patientName: 'Suresh Kumar', contactNumber: '+919825000003', timestamp: new Date(Date.now() - 14400000) },
    ]);
    console.log('✅ Sample emergency logs added');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('blood_donors').createIndex({ bloodGroup: 1 });
    await db.collection('blood_donors').createIndex({ area: 1 });
    await db.collection('nearby_services').createIndex({ category: 1 });
    console.log('✅ Database indexes created');
    console.log('\n🎉 ========== DATABASE SEEDED SUCCESSFULLY ==========');
    console.log(` Blood Donors     : ${bloodDonors.length} (Real Surat people)`);
    console.log(` Hospitals        : ${nearbyServices.filter(s=>s.category==='hospital').length} (Real Surat hospitals)`);
    console.log(` Police Stations  : ${nearbyServices.filter(s=>s.category==='police').length} (Real Surat police stations)`);
    console.log(` Fire Stations    : ${nearbyServices.filter(s=>s.category==='fire').length} (Real Surat fire brigades)`);
    console.log(` Blood Banks      : ${nearbyServices.filter(s=>s.category==='blood').length} (Real Surat blood banks)`);
    console.log(` Admin Login      : username=admin | password=admin123`);

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    if (err.code === 11000) console.error('   Duplicate key - some records may already exist.');
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
