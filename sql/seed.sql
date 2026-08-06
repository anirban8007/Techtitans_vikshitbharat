-- Run AFTER schema.sql. 14 realistic complaints across Kolkata so the map/dashboard looks alive.
-- Swap coordinates for your own demo city if needed — just grab them from Google Maps (right-click > coordinates).

insert into complaints (category, description, latitude, longitude, status, department, reporter_name, created_at) values
('pothole', 'Large pothole near Gariahat crossing, causing traffic slowdown', 22.5185, 88.3654, 'pending', 'PWD', 'Ritwik Sen', now() - interval '2 days'),
('pothole', 'Deep pothole on AJC Bose Road flyover ramp', 22.5390, 88.3540, 'in_progress', 'PWD', 'Diya Ghosh', now() - interval '1 day'),
('garbage', 'Garbage pile not collected for a week near Lake Market', 22.5170, 88.3600, 'pending', 'Solid Waste Mgmt', 'Sourav Ghosh', now() - interval '3 days'),
('garbage', 'Overflowing bin outside New Market entrance', 22.5620, 88.3520, 'resolved', 'Solid Waste Mgmt', 'Priya Das', now() - interval '5 days'),
('drain', 'Drain overflow flooding footpath near Park Circus', 22.5390, 88.3720, 'pending', 'KMC Drainage', 'Arjun Mukherjee', now() - interval '12 hours'),
('drain', 'Blocked drain causing waterlogging in Ballygunge', 22.5245, 88.3650, 'in_progress', 'KMC Drainage', 'Tanmoy Bose', now() - interval '2 days'),
('streetlight', 'Streetlight not working outside Rabindra Sadan', 22.5430, 88.3520, 'pending', 'CESC', 'Sneha Chatterjee', now() - interval '4 days'),
('streetlight', 'Three consecutive streetlights out near Gol Park', 22.5165, 88.3670, 'pending', 'CESC', 'Rahul Banerjee', now() - interval '1 day'),
('pothole', 'Pothole widening after rain near Gariahat crossing', 22.5187, 88.3656, 'pending', 'PWD', 'Debjani Sarkar', now() - interval '6 hours'),
('garbage', 'Construction debris dumped illegally near Jadavpur 8B', 22.4990, 88.3710, 'pending', 'Solid Waste Mgmt', 'Kabir Ahmed', now() - interval '18 hours'),
('drain', 'Sewage smell and overflow near Kalighat', 22.5200, 88.3420, 'resolved', 'KMC Drainage', 'Moumita Dutta', now() - interval '6 days'),
('streetlight', 'Flickering streetlight, safety concern for pedestrians', 22.5090, 88.3550, 'in_progress', 'CESC', 'Vikram Nair', now() - interval '3 days'),
('pothole', 'Multiple potholes near Tollygunge metro station exit', 22.4990, 88.3480, 'pending', 'PWD', 'Ishita Chakraborty', now() - interval '9 hours'),
('garbage', 'Garbage burning causing smoke near Behala market', 22.4930, 88.3140, 'pending', 'Solid Waste Mgmt', 'Amit Roy', now() - interval '1 day');
