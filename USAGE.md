# People Network Application - User Guide

This document explains how to use the People Network application to visualize and manage a network of people and their relationships.

## Accessing the Application
1. **Start the backend server** (see README.md for setup instructions).
2. **Start the frontend server**.
3. Open your browser and go to the frontend URL (e.g., `http://localhost:5173`).

## Main Features
### 1. Visualize the Network
- The main page displays a network graph of people (nodes) and their relationships (edges).
- You can zoom, pan, and interact with the graph.

### 2. Add a Person
- Click the **Add Person** button (or similar UI element).
- Fill in the person's details (e.g., name, attributes).
- Submit the form to add the person to the network.

### 3. Add a Relationship
- Select two people in the network.
- Click the **Add Relationship** button.
- Specify the relationship type (e.g., friend, colleague).
- Submit to create the connection.

### 4. Edit or Remove
- Click on a person or relationship in the graph to view options.
- Use the edit or delete buttons to modify or remove entries.

### 5. Export the Network
- Use the **Export as Image** or **Export as PDF** buttons to download the current network view.

## Tips
- Changes are saved automatically to the backend database.
- Refresh the page to reload the latest data.
- If the network does not update, ensure both backend and frontend servers are running.

## Troubleshooting
- **Cannot connect to backend:** Make sure the backend server is running and accessible at the configured URL.
- **Graph not displaying:** Check the browser console for errors and verify all dependencies are installed.

## Support
For questions or issues, please open an issue in the repository or contact the maintainer.
