# BearsCafe

# Smart Cafeteria
A full-stack web application designed to improve communication between cafeteria staff and students by providing students with information about available meals and allowing them to provide feedback.
The application also includes an AI-assisted image recognition feature that helps cafeteria staff identify food items from uploaded meal photos, reducing manual data entry.

## Project Overview
The Smart Cafeteria application provides separate functionality for students and cafeteria staff.

### Students can:
* View available cafeteria meals
* View meal images and descriptions
* Rate meals from 1–5 stars
* Leave optional feedback
* View meal ratings and information

### Cafeteria staff can:
* Create and manage meal information
* Upload meal images
* Use AI to identify food items in images
* Review and correct AI-generated suggestions
* Publish meals for students
* View student ratings and feedback
* View basic meal-performance analytics

### AI-Assisted Workflow
The AI feature is designed to assist cafeteria staff rather than replace their decision-making.
The workflow is:
Upload Image → AI Analysis → Suggested Food Items → Staff Review → Correction if Needed → Publish
Staff members will always have the ability to review and correct the AI-generated results before the meal is shown to students.

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
* AI / Computer Vision API for food image recognition


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
├── docs/
│   ├── SRS
│   ├── UML diagrams
│   └── Database design
│
└── README.md
```

## Planned User Roles
| Role          | Main Responsibilities                              |
| ------------- | -------------------------------------------------- |
| Student       | View meals, rate meals, provide feedback           |
| Staff         | Manage meals, upload images, review AI suggestions |
| Manager/Admin | View analytics and manage administrative functions |

## Planned Core Features
* [ ] User authentication
* [ ] Role-based authorization
* [ ] Student meal dashboard
* [ ] Staff meal management
* [ ] Meal image uploads
* [ ] AI-assisted food identification
* [ ] Staff verification of AI results
* [ ] 1–5 star meal ratings
* [ ] Student feedback
* [ ] Staff analytics dashboard
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

## Current Status
Project Phase: Planning / Requirements
The project is currently in the planning and requirements phase. Development of the application will begin after the initial requirements and system design have been finalized.

## Future Goals
Potential future improvements include:
* AI-generated summaries of student feedback
* More advanced analytics
* Dietary and allergen information
* Meal recommendations
* Push notifications
* Future meal schedules
* University authentication integration
* Mobile application
* Custom food-recognition model


CSC 490 – Senior Project
Shaw University
Fall 2026
