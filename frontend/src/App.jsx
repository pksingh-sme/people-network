import React, { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "vis-network/styles/vis-network.css";

export default function FamilyFriendsNetwork() {
  const [people, setPeople] = useState([
    { id: 1, name: "Alice", group: "family" },
    { id: 2, name: "Bob", group: "friend" },
  ]);
  const [relations, setRelations] = useState([]);
  const [newName, setNewName] = useState("");
  const [group, setGroup] = useState("family");
  const [selectedNode, setSelectedNode] = useState(null);
  const [relationLabel, setRelationLabel] = useState("");
  const [highlightNode, setHighlightNode] = useState(null);

  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const groupColors = { family: "#ff9999", friend: "#99ccff", colleague: "#a1ff9e" };

  // Initialize network
  const initializeNetwork = () => {
    if (!containerRef.current) return;

    const nodes = new DataSet(
      people.map((p) => ({
        id: p.id,
        label: p.name,
        color: groupColors[p.group] || "#ccc",
      }))
    );

    const edges = new DataSet(relations);

    const network = new Network(containerRef.current, { nodes, edges }, {
      edges: { arrows: "to" },
      interaction: { hover: true },
      physics: { enabled: true },
      layout: {
        hierarchical: {
          enabled: true,
          levelSeparation: 120,
          nodeSpacing: 150,
          direction: "UD",
          sortMethod: "directed",
        },
      },
    });

    // Click-to-map relation
    network.on("selectNode", (params) => {
      const nodeId = params.nodes[0];
      if (selectedNode === null) {
        setSelectedNode(nodeId);
      } else if (selectedNode !== nodeId && relationLabel.trim() !== "") {
        setRelations((prev) => [...prev, { from: selectedNode, to: nodeId, label: relationLabel }]);
        setSelectedNode(null);
        setRelationLabel("");
      } else {
        setSelectedNode(null);
      }
    });

    // Hover highlight
    network.on("hoverNode", (params) => {
      const hoverId = params.node;
      const connected = network.getConnectedNodes(hoverId);
      nodes.update(
        nodes.get().map((node) => ({
          ...node,
          color:
            node.id === hoverId
              ? "#00CED1"
              : connected.includes(node.id)
              ? "#90ee90"
              : groupColors[people.find((p) => p.id === node.id)?.group] || "#ccc",
        }))
      );

      edges.update(
        edges.get().map((edge) => ({
          ...edge,
          color: edge.from === hoverId || edge.to === hoverId ? "#FFA500" : "#ccc",
        }))
      );
    });

    // Maintain highlight when hover ends
    network.on("blurNode", () => {
      setHighlightNode(highlightNode);
    });

    networkRef.current = network;

    // Apply highlight from member list
    if (highlightNode !== null) {
      const connectedNodes = network.getConnectedNodes(highlightNode);
      nodes.update(
        nodes.get().map((node) => ({
          ...node,
          color:
            node.id === highlightNode
              ? "#FFD700"
              : connectedNodes.includes(node.id)
              ? "#90ee90"
              : "#ddd",
        }))
      );
      edges.update(
        edges.get().map((edge) => ({
          ...edge,
          color: edge.from === highlightNode || edge.to === highlightNode ? "#FFA500" : "#ccc",
        }))
      );
    }
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      initializeNetwork();
    });
    return () => cancelAnimationFrame(id);
  }, [people, relations, highlightNode, relationLabel]);

  // Add Member
  const addMember = () => {
    if (!newName.trim()) return;
    const newId = people.length ? Math.max(...people.map((p) => p.id)) + 1 : 1;
    setPeople([...people, { id: newId, name: newName, group }]);
    setNewName("");
  };

  // Edit/Delete Member
  const editMember = (id) => {
    const newNameInput = prompt("Enter new name:");
    const newGroupInput = prompt("Enter group:");
    if (newNameInput) {
      setPeople(
        people.map((p) =>
          p.id === id ? { ...p, name: newNameInput, group: newGroupInput || p.group } : p
        )
      );
    }
  };

  const deleteMember = (id) => {
    setPeople(people.filter((p) => p.id !== id));
    setRelations(relations.filter((r) => r.from !== id && r.to !== id));
    if (highlightNode === id) setHighlightNode(null);
  };

  // Export functions
  const downloadImage = async () => {
    const canvas = await html2canvas(containerRef.current);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "network.png";
    link.click();
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(containerRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape");
    pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
    pdf.save("network.pdf");
  };

  return (
    <div style={{ display: "flex", height: "100vh", flexWrap: "wrap" }}>
      {/* Left Panel */}
      <div
        style={{
          width: "300px",
          padding: "15px",
          background: "#f5f5f5",
          borderRight: "1px solid #ccc",
          flexShrink: 0,
          boxSizing: "border-box",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {/* Add Member Section */}
        <div style={{ padding: "10px", marginBottom: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Add Member</h3>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            style={{ width: "100%", padding: "6px", marginBottom: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            style={{ width: "100%", padding: "6px", marginBottom: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="colleague">Colleague</option>
          </select>
          <button
            onClick={addMember}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", background: "#4CAF50", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Add
          </button>
        </div>

        {/* Relation Mapping Section */}
        <div style={{ padding: "10px", marginBottom: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Relation Mapping</h3>
          <input
            placeholder="Enter relation label"
            value={relationLabel}
            onChange={(e) => setRelationLabel(e.target.value)}
            style={{ width: "100%", padding: "6px", marginBottom: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <p style={{ fontSize: "12px", color: "#666" }}>Click two nodes to create relation</p>
        </div>

        {/* Members List Section */}
        <div style={{ padding: "10px", marginBottom: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Members</h3>
          {people.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "5px 0", padding: "6px", background: highlightNode === p.id ? "#FFD700" : "#f9f9f9", borderRadius: "4px" }}>
              <span onClick={() => setHighlightNode(p.id)} style={{ cursor: "pointer", flex: 1 }}>{p.name}</span>
              <select
                onChange={(e) => {
                  if (e.target.value === "edit") editMember(p.id);
                  if (e.target.value === "delete") deleteMember(p.id);
                  e.target.value = "";
                }}
              >
                <option value="">⋮</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          ))}
        </div>

        {/* Legend Section */}
        <div style={{ padding: "10px", marginBottom: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Legend</h3>
          {Object.entries(groupColors).map(([grp, color]) => (
            <div key={grp} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
              <div style={{ width: "20px", height: "20px", backgroundColor: color, marginRight: "8px", border: "1px solid #000", borderRadius: "3px" }}></div>
              <span style={{ textTransform: "capitalize" }}>{grp}</span>
            </div>
          ))}
        </div>

        {/* Export Section */}
        <div style={{ padding: "10px", marginBottom: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Export</h3>
          <button onClick={downloadImage} style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "4px", background: "#2196F3", color: "#fff", border: "none", cursor: "pointer" }}>Download Image</button>
          <button onClick={downloadPDF} style={{ width: "100%", padding: "8px", borderRadius: "4px", background: "#FF5722", color: "#fff", border: "none", cursor: "pointer" }}>Download PDF</button>
        </div>

        {/* Reset Highlight */}
        <div style={{ padding: "10px", marginBottom: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <button onClick={() => setHighlightNode(null)} style={{ width: "100%", padding: "8px", borderRadius: "4px", background: "#9E9E9E", color: "#fff", border: "none", cursor: "pointer" }}>Reset Highlight</button>
        </div>
      </div>

      {/* Right Panel: Network */}
      <div style={{ width: "calc(100% - 300px)", minWidth: "300px", height: "100%", boxSizing: "border-box" }}>
        <div
          ref={containerRef}
          style={{ height: "100%", width: "100%", minHeight: "600px", border: "1px solid #ccc", borderRadius: "4px" }}
        ></div>
      </div>
    </div>
  );
}
