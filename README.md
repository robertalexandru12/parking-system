# parking-system
This project is a complete smart parking system consisting of two integrated parts: a web application for administrators and users, and a hardware platform for real-time parking management. The system automates monitoring, vehicle tracking, parking reservations, and fee management.


## Project Components

### 1. Web Application
**Admin Dashboard:**
- Manage the parking map and pricing
- Track vehicle history using license plate numbers
- View real-time parking occupancy and statistics

**User Interface:**
- Reserve parking spots in advance
- View the parking map and check available spaces

Built with **React** (frontend) and **Spring Boot** (backend)  
**Database:** MySQL

### 2. Hardware Platform (IoT)
- **Sensors:** Ultrasonic sensors detect occupied parking spaces
- **Actuators:** Two servomotors – one for the entrance barrier, one to rotate the camera
- **Camera Module:** Captures license plates of entering and exiting vehicles
- **Controller:** Raspberry Pi Zero 2W
- **License Plate Recognition:** OpenALPR library for automatic detection

## Tech Stack
- **Backend:** Spring Boot (Java)
- **Frontend:** React
- **Database:** MySQL
- **Hardware:** Raspberry Pi Zero 2W, ultrasonic sensors, servo motors, camera module
- **Computer Vision:** OpenALPR

## Features
- Automatic detection and logging of vehicle entry/exit
- Real-time monitoring of parking occupancy
- Admin dashboard for pricing, parking map, and vehicle history
- User interface for reservations and live parking availability
- Full integration of hardware and software for seamless automation
