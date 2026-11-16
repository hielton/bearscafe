# BearsCafe

# Smart Cafeteria
A full-stack web application designed to improve communication between cafeteria staff and students by providing students with information about available meals and allowing them to provide feedback.
The application also includes an AI-assisted image recognition feature that helps cafeteria staff identify food items from uploaded meal photos, reducing manual data entry.

## Live Application
Frontend: https://bearscafe.netlify.app
Backend API: https://bearscafe-backend.onrender.com
Deployment Notice: The backend is hosted on Render's free tier, which automatically spins down after approximately 15 minutes of inactivity. The first request after an idle period may take additional time while the server restarts. Once the backend is active, subsequent requests should respond normally.

The backend's local filesystem is also ephemeral, meaning uploaded images stored locally may be lost after restarts or redeployments. Persistent cloud image storage is planned as a future improvement.


## Project Overview
The Smart Cafeteria application provides separate functionality for students and cafeteria staff.

### Students can:
* View available cafeteria meals
* View meal images and descriptions
* Rate meals from 1–5 stars
* Leave optional feedback, but required by 1-2 stars
* View meal ratings and information
* Ask food-related questions through an AI-powered chatbot

### Cafeteria staff can:
* Publish meals for students
* Create and manage meal information
* Upload meal images
* View student ratings and feedback
* View basic meal-performance analytics

## AI-Powered Nutrition Chatbot

BearsCafe includes an AI chatbot powered by Google's Gemini API.

The chatbot helps students explore food-related topics, including meal ingredients, nutritional information, and general dietary questions.

### USDA Nutrition Integration

The application also integrates the USDA FoodData Central API to retrieve nutritional information for recognized or selected food items.

This enables the application to provide estimates of nutritional values based on available USDA food records.

Limitations: Nutritional information is estimated rather than laboratory-verified. Accuracy depends on the availability of matching USDA entries, portion sizes, and the similarity between database records and actual cafeteria meals.

## Project Goals
The main goals of the project are to:
1. Develop a functional full-stack cafeteria application.
2. Make cafeteria meal information more accessible to students.
3. Reduce manual data entry for cafeteria staff through AI-assisted image recognition.
4. Collect structured student feedback about cafeteria meals.
5. Provide basic analytics that can help cafeteria staff understand student preferences.
6. Demonstrate the complete Software Development Lifecycle from requirements and design through development, testing, and deployment.

## Technology Stack

### Frontend
* React
* JavaScript
* HTML
* CSS

### Backend
* Java
* Spring Boot
* Spring Web / REST API
* Spring Data JPA
* Spring Security

### Database
* PostgreSQL

### AI
* Gemini AI

### Nutrition Data
* USDA FoodData Central API

### Security
* Spring Securtity
* JWT
* BCrypt

## Project Structure
```text
smart-cafeteria/
│
├── backend/
│   └── Spring Boot application
│
├── frontend/
│   └── React application
│
└── README.md
```

## Planned User Roles
| Role          | Main Responsibilities                                   |
| ------------- | ------------------------------------------------------- |
| Student       | View meals, rate meals, provide feedback, chat with AI  |
| Staff         | Manage meals, upload images                             |
| Manager/Admin | View analytics and manage administrative functions      |

## Planned Core Features
* [ ] User authentication
* [ ] Role-based authorization
* [ ] Student meal dashboard
* [ ] Staff meal management
* [ ] Meal image uploads
* [ ] 1–5 star meal ratings
* [ ] Student feedback
* [ ] Staff analytics dashboard
* [ ] AI-powered nutrition chatbot
* [ ] Testing and validation
* [ ] Deployment

## Project Scope
The project focuses on providing students with information about cafeteria meals and giving cafeteria staff an efficient way to publish and manage meal information.
The following are outside the primary scope:
* Online food ordering
* Online payments
* Food delivery
* Inventory management
* Employee scheduling
* Financial management
* University meal-plan integration
* Developing a custom AI model from scratch
Advanced features may be considered as stretch goals after the core application has been completed.

## Development Approach
The project will be developed incrementally following the Software Development Lifecycle (SDLC):
1. Requirements and Planning
2. System Design
3. Implementation
4. Testing
5. Deployment
6. Evaluation and Documentation


## Future Goals
Potential future improvements include:
* AI-generated summaries of student feedback
* More advanced analytics
* Improve USDA nutrition matching
* Push notifications
* Future meal schedules
* University authentication integration
* Improve scalability and performance
* Persistent image storage


CSC 490 – Senior Project
Shaw University
Fall 2026
