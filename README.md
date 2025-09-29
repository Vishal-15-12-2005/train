# **🚆 AI RailFlow: A Complete AI System for Railway Traffic Management**

This project provides a complete, end-to-end implementation of an AI-powered railway management system. It is designed to tackle the complex **Real-time Railway Traffic Management Problem (rtRTMP)** by using a sophisticated, two-stage AI approach.

## **📖 Table of Contents**

* [The Problem]  
* [The Dual-AI Solution]  
* [Project Structure] 
* [Technology Stack]
* [Getting Started]  
* [How to Use the Project]
* [Understanding the Simulation]
* [Future Work]

## **🎯 The Problem**

The core challenge in modern railway operations is managing network efficiency in the face of constant, unpredictable disruptions. A minor delay to a single train can trigger a cascading "knock-on effect," causing widespread disruption. This project aims to solve this by creating an intelligent system that can both plan optimal schedules and react to live disruptions.

## **💡 The Dual-AI Solution**

This project uses a unique two-part AI architecture for comprehensive traffic management:

### **1\. The Strategic Scheduler (The Planner)**

This is a data-driven model that acts as an expert planner. It takes all the required train services for a day as input and generates a complete, conflict-minimized master timetable from scratch. It ensures that the initial schedule is as efficient as possible.

### **2\. The Real-time RL Agent (The Problem-Solver)**

This is a **Reinforcement Learning** agent trained within a **Digital Twin** simulation of the railway. Its job is to manage the live network. When random, unpredicted delays occur in the simulation, this agent learns the optimal sequence of actions (holding or proceeding trains) to minimize the impact of the disruption and keep the network flowing smoothly.

This combination of proactive planning and reactive control makes for a robust and powerful system.

## **📂 Project Structure**

The project is organized into a modular pipeline, with each script performing a specific task:

.  
├── data/                  \# Directory for all generated data  
│   ├── stations.csv  
│   ├── tracks.csv  
│   ├── schedule\_requests.csv  
│   └── generated\_timetable.csv  
├── models/                \# Directory for the saved, trained AI model  
│   └── railopt\_ai\_agent.zip  
├── data\_generator.py      \# Creates realistic synthetic railway data.  
├── strategic\_scheduler.py \# The "Planner" AI that generates the master timetable.  
├── digital\_twin\_env.py    \# The simulation environment (Digital Twin).  
├── train\_rl\_agent.py      \# Trains the "Problem-Solver" RL agent.  
├── test\_agent.py          \# A tool to test and evaluate the trained agent.  
└── main.py                \# The main script to run the entire pipeline.

## **🛠️ Technology Stack**

* **Core Language:** Python  
* **Data Handling:** Pandas  
* **Network Modeling:** NetworkX  
* **Reinforcement Learning:** Gymnasium (the standard API for RL environments)  
* **AI Agent:** Stable-Baselines3 (a leading library for high-quality RL algorithms)  
* **ML Framework:** PyTorch (as the backend for Stable-Baselines3)

## **🚀 Getting Started**

Follow these steps to set up the project on your local machine.

### **Prerequisites**

* Python 3.9 or higher  
* pip (Python package installer)

### **Installation**

1. **Clone the Repository**  
   git clone \[https://github.com/your-username/RailOpt-AI.git\](https://github.com/your-username/RailOpt-AI.git)  
   cd RailOpt-AI

2. **Create a Virtual Environment** (Highly Recommended)  
   python \-m venv venv  
   source venv/bin/activate  \# On Windows: venv\\Scripts\\activate

3. Install Required Libraries  
   Create a file named requirements.txt and add the following lines to it:  
   pandas  
   networkx  
   gymnasium  
   stable-baselines3\[torch\]  
   faker

   Then, install them all with a single command:  
   pip install \-r requirements.txt

## **⚙️ How to Use the Project**

The project is designed to be run from a single, main script.

### **1\. Run the Full Pipeline**

To generate the data, create a schedule, and train the AI, simply run main.py:

python main.py

This will execute all the necessary steps in sequence and conclude with a demonstration of the trained agent managing a simulated railway with random disruptions.

### **2\. Test the Trained Agent**

After the main script has run successfully, a trained model will be saved in the models/ directory. You can then use test\_agent.py to evaluate it in different ways:

python test\_agent.py

This will launch an interactive testing suite where you can:

* Run a single, fast simulation.  
* Get a full performance evaluation over multiple runs.  
* Enter an interactive mode to step through the simulation and even override the AI's decisions.

## **📊 Understanding the Simulation**

During the demonstration and testing, you will see a text-based visualization of the railway:

Train 12007: MAS \[=========\>-----------\] AJJ | Delay: 0 min  
