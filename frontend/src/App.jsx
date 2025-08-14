import React, { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";

export default function App() {
  const [people, setPeople] = useState([
    { id: 1, name: "Alice", group: "family" },
    { id: 2, name: "Bob", group: "friend" },
    { id: 3, name: "Charlie", group: "family" },
  ]);
  const [relations, setRelations] = useState([
    { from: 1, to: 2, label: "Friend", color: "#888" },
    { from: 1, to: 3, label: "Sibling", color: "#f00" },
  ]);

  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("friend");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editGroup, setEditGroup] = useState("");

  const [selectedPerson, setSelectedPerson] = useState(null); // Highlight individual
  const [selectedNode, setSelectedNode] = useState(null); // Interactive edge creation
  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const groupColors = {
    family: "#ff9999",
    friend: "#99ccff",
    colleague: "#99ff99",
  };

  // Add new person
  const addPerson = () => {
    if (!newName.trim()) return;
    const newId = people.length ? Math.max(...people.map(p => p.id)) + 1 : 1;
    setPeople([...people, { id: newId, name: newName, group: newGroup }]);
    setNewName("");
  };

  const deletePerson = (id) => {
    setPeople(people.filter(p => p.id !== id));
    setRelations(relations.filter(r => r.from !== id && r.to !== id));
  };

  const startEdit = (id, name, group) => {
    setEditId(id);
    setEditName(name);
    setEditGroup(group);
  };

  const updatePerson = () => {
    setPeople(people.map(p => p.id === editId ? { ...p, name: editName, group: editGroup } : p));
    setEditId(null);
    setEditName("");
    setEditGroup("");
  };

  // Draw graph
  const drawNetwork = () => {
    let nodes = people.map(p => ({
      id: p.id,
      label: p.name,
      color: groupColors[p.group] || "#ccc",
      shape: "dot",
      size: 20,
    }));

    let edges = relations.map(r => ({
      from: r.from,
      to: r.to,
      label: r.label,
      color: r.color || "#888",
    }));

    // Filter by selected individual
    if (selectedPerson) {
      const connectedIds = new Set();
      edges.forEach(e => {
        if (e.from === selectedPerson || e.to === selectedPerson) {
          connectedIds.add(e.from);
          connectedIds.add(e.to);
        }
      });
      nodes = nodes.filter(n => connectedIds.has(n.id));
      edges = edges.filter(e => connectedIds.has(e.from) && connectedIds.has(e.to));
    }

    const container = containerRef.current;
    if (container) {
      const network = new Network(container, { nodes: new DataSet(nodes), edges: new DataSet(edges) }, {
        edges: { arrows: "to", smooth: true },
        physics: { enabled: true, stabilization: true },
        interaction: { hover: true, tooltipDelay: 100 },
      });

      networkRef.current = network;

      // Interactive node-to-node edge creation
      network.on("selectNode", (params) => {
        const nodeId = params.nodes[0];
        if (!selectedNode) {
          setSelectedNode(nodeId);
        } else if (selectedNode && selectedNode !== nodeId) {
          const label = prompt("Enter relationship label:");
          if (label) {
            const color = label.toLowerCase() === "friend" ? "#888" : "#f00";
            setRelations(prev => [...prev, { from: selectedNode, to: nodeId, label, color }]);
          }
          setSelectedNode(null);
        }
      });
    }
  };

  useEffect(() => {
    drawNetwork();
  }, [people, relations, selectedPerson, selectedNode]);

  return (
    <div style={{ maxWidth: 1200, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Family & Friends Network</h1>

      {/* Add/Edit Person */}
      <div style={{ marginBottom: 20 }}>
        <input
          style={{ padding: "6px", marginRight: "6px" }}
          value={editId ? editName : newName}
          onChange={e => editId ? setEditName(e.target.value) : setNewName(e.target.value)}
          placeholder="Enter name"
        />
        <select
          value={editId ? editGroup : newGroup}
          onChange={e => editId ? setEditGroup(e.target.value) : setNewGroup(e.target.value)}
          style={{ padding: "6px", marginRight: "6px" }}
        >
          <option value="family">Family</option>
          <option value="friend">Friend</option>
          <option value="colleague">Colleague</option>
        </select>
        <button onClick={editId ? updatePerson : addPerson} style={{ padding: "6px 12px" }}>
          {editId ? "Update" : "Add"} Person
        </button>
      </div>

      {/* People List */}
      <ul>
        {people.map(p => (
          <li key={p.id}>
            {p.name} ({p.group})
            <button onClick={() => startEdit(p.id, p.name, p.group)} style={{ marginLeft: "6px" }}>Edit</button>
            <button onClick={() => deletePerson(p.id)} style={{ marginLeft: "6px" }}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Highlight Individual */}
      <div style={{ marginTop: 20 }}>
        <label>View Network for: </label>
        <select value={selectedPerson || ""} onChange={e => setSelectedPerson(e.target.value ? parseInt(e.target.value) : null)}>
          <option value="">All</option>
          {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {selectedNode && <span style={{ marginLeft: "10px", color: "green" }}>Select another node to create relation...</span>}
      </div>

      {/* Network Graph */}
      <div
        ref={containerRef}
        style={{ height: "500px", border: "1px solid gray", marginTop: "20px" }}
      ></div>
    </div>
  );
}
