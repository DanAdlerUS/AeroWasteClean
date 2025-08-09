# AeroWaste

AeroWaste is a service for governments and companies to identify and collect litter using drones. The proof of concept uses the DJI Mini 4 Pro drone, with a scalable backend and frontend to support the service.

## Project Overview

AeroWaste combines drone technology and software to automate litter detection and collection. The platform is designed for environmental agencies, municipalities, and businesses seeking innovative solutions for waste management.

## Features

- **Drone Integration**: Leverages DJI Mini 4 Pro for aerial surveillance and data collection.
- **Automated Litter Detection**: Processes images and videos to identify litter locations.
- **Backend API**: Built with FastAPI and Docker, scalable for future enhancements.
- **Frontend Application**: To be developed for user interaction and management.
- **Proof of Concept**: Initial focus on validating drone and backend integration.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Containerization**: Docker
- **Frontend**: (Planned) React or Vue.js
- **Drone SDK**: DJI Mini 4 Pro
- **Database**: (Planned) PostgreSQL or MongoDB

## Getting Started

### Prerequisites

- Docker
- Python 3.10+
- (Planned) Node.js for frontend

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/DanAdlerUS/AeroWaste.git
    cd AeroWaste
    ```
2. Build and run the backend using Docker:
    ```sh
    docker-compose up --build
    ```
3. Access the API documentation:
    - [http://localhost:8000/docs](http://localhost:8000/docs)

### Development

- Backend code is in the `app/` directory.
- API routes are defined under `app/api/routes/`.
- Frontend development will begin after the backend proof of concept.

## Usage

- Use the API documentation at `/docs` for available endpoints and testing.
- (Planned) Frontend will provide a user-friendly interface for managing drone missions and viewing analytics.

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, enhancements, or new features.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add your feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

## Contact

Project Owner: [Dan Adler](https://github.com/DanAdlerUS)  
Questions or support: Please open an issue in the repository.