# FAQ

## What are the minimum hardware requirements to run it locally?

To ensure a smooth operation of Cardano Smart locally, the following minimum system requirements are recommended:

- **Processor:**  
  A minimum of a 4-core processor is recommended. An 8-core processor or better is ideal if you plan to run the system without a dedicated GPU.
- **RAM:**  
  At least 16 GB of RAM is necessary to handle larger models and maintain optimal performance.
- **Disk Space:**  
  Ensure you have at least 10 GB of free space available for storing models and necessary updates.
- **GPU (Optional):**  
  For enhanced performance, an Nvidia GPU with a compute capability of 6.0 or higher is advisable. You can verify your GPU’s compute capability [here](https://developer.nvidia.com/cuda-gpus). If a suitable GPU is not available, the system can still operate in CPU mode, although this will be significantly slower.

> **Note:** Using a GPU accelerates processing and is highly recommended for efficiency, but it is not strictly required if your CPU is sufficiently powerful.

---

## For a cloud set-up, what specs for the server are recommended?

For optimal cloud deployment of Cardano Smart on a Kubernetes cluster, the following specifications are recommended:

- **GPU Nodes:**  
  At least one node equipped with an Nvidia Tesla T4 GPU or equivalent, along with at least 16 GB of regular RAM and 2 CPU cores. This setup is crucial for handling compute-intensive tasks efficiently.
- **Standard Nodes:**  
  Additional nodes should have at least 16 GB of RAM and 2 CPU cores to support other essential workloads seamlessly.
- **Lightweight Workload Node:**  
  For less demanding tasks, a node with a minimum of 2 GB RAM may suffice.

The project leverages Kubernetes’ autoscaling capabilities (both vertical and horizontal) to dynamically allocate resources based on workload demands. For environments expecting a high number of concurrent users, it is advisable to deploy additional GPU nodes—consider configuring three or more GPU nodes for robust performance and availability.

---

## How expensive is it to run on a cloud server?

Running Cardano Smart on a cloud server (e.g., using Google Cloud Platform with a dedicated Google Kubernetes Engine cluster) can be quite costly due to the high-performance resources required. For a typical setup with three GPU nodes:

- **Estimated Cost:**  
  Costs can exceed $1000 per month based on continuous usage and the expense associated with high-performance GPU nodes.

The actual cost may vary based on usage patterns and the number of active users, as Kubernetes’ auto-scaling features can dynamically adjust resource allocation. In some cases, deploying on a local Kubernetes cluster or a powerful local machine might be more cost-effective.

---

## In some places, DeepSeek is blocked or banned for use. Can you provide a link to the previous version with Llama?

If certain models like DeepSeek are restricted in your region, you can switch to alternative models such as Llama. Our project uses open-source versions of these models that are hosted on your own hardware or private cloud infrastructure, ensuring full control over your models and data.

To switch models, specify your preferred model when running the build script for the privateGPT component. For example, to use the Llama model:

```bash
./build_scripts/build_private_gpt.sh "llama3.2"
```

This command configures privateGPT to deploy the "llama3.2" model. You can update or change the model at any time by rebuilding and redeploying using the build script. Detailed instructions for building with different models are available in the main README file.

---

## Is an Nvidia GPU needed to run locally?

No, an Nvidia GPU is not strictly required, but it is highly recommended for optimal performance—especially for larger models. Here are the recommendations:

- **With GPU:**  
  An Nvidia GPU with Compute Capability 6.0 or higher significantly enhances performance, enabling faster processing and better handling of complex computations.
- **Without GPU:**  
  If you do not have access to an Nvidia GPU, you can run the project on a CPU. For a smooth experience, use a CPU with at least 8 cores. However, note that running in CPU mode will be considerably slower.

---

## Can you add Helios? ([https://www.hyperion-bt.org/](https://www.hyperion-bt.org/))

Yes, Helios integration is on our roadmap. We are developing a new scraping spider specifically for Helios that will leverage their comprehensive documentation. This update will be available shortly.

---

## Is it better to use it for a complete dApp? Or is it better to ask particular questions?

Cardano Smart is best utilized as an assistant for developers rather than a complete dApp replacement. It excels at providing real-time, up-to-date Cardano documentation and generating code snippets, streamlining the development process. While it supports various aspects of full dApp development, it is particularly effective for answering specific questions and addressing development challenges as they arise, ensuring developers receive timely support.

