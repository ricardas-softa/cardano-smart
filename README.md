# Cardano Smart

Cardano Smart is an open-source project that integrates with [PrivateGPT](https://github.com/zylon-ai/private-gpt) to provide a comprehensive solution for LLM driven chat bot for Cardano documentation.

## Features

- Frontend and backend integration
- Google Cloud deployment configurations (particularly for Google Kubernetes Engine)
- Local setup using Docker

## Getting Started

### Prerequisites

- Docker
- Docker Compose
- *(optional)* Google Cloud SDK (for GKE deployment)

### Local Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/ricardas-softa/cardano-smart
    cd cardano-smart
    ```

2. Run the setup script:
    ```sh
    ./scripts/setup_local.sh
    ```

3. Start the services:
    ```sh
    docker-compose up
    ```

### GKE Deployment

1. Set up Google Cloud SDK and authenticate your account.
2. Create a new project in Google Cloud Console.
3. Create a new Kubernetes cluster of your choice in the project.
4. Deploy Ollama:
    ```sh
    cd gcloud/ollama
    ./deploy.sh
    ```

5. Deploy PrivateGPT:
    ```sh
    cd gcloud/private-gpt
    ./deploy.sh
    ```

6. Deploy Cardano Smart frontend:
    ```sh
    cd gcloud/frontend
    ./deploy.sh
    ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [PrivateGPT](https://github.com/original-provider/private-gpt)
