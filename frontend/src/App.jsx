import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "vis-network/styles/vis-network.css";

export default function FamilyFriendsNetwork() {
  const [people, setPeople] = useState([
    { id: 1, name: "Alice", group: "family" },
    { id: 2, name: "Bob", group: "friend" },
  ]);
  const [relations, setRelations] = useState([{ from: 1, to: 2, label: "Sister" }]);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("family");
  const [relFrom, setRelFrom] = useState("");
  const [relTo, setRelTo] = useState("");
  const [relLabel, setRelLabel] = useState("");

  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const groupColors = {
    family: "#ff9999",
    friend: "#99ccff",
    colleague: "#99ff99",
    other: "#cccccc",
  };

  // Build & render network
  useEffect(() => {
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
    });

    networkRef.current = network;
  }, [people, relations]);

  // Add member
  const addMember = () => {
    if (!newName.trim()) return;
    const id = people.length ? Math.max(...people.map((p) => p.id)) + 1 : 1;
    setPeople([...people, { id, name: newName, group: newGroup }]);
    setNewName("");
  };

  // Delete member
  const deleteMember = (id) => {
    setPeople(people.filter((p) => p.id !== id));
    setRelations(relations.filter((r) => r.from !== id && r.to !== id));
  };

  // Edit member
  const editMember = (id, name, group) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, name, group } : p)));
  };

  // Add relationship
  const addRelationship = () => {
    if (!relFrom || !relTo || !relLabel) return;
    setRelations([...relations, { from: parseInt(relFrom), to: parseInt(relTo), label: relLabel }]);
    setRelFrom("");
    setRelTo("");
    setRelLabel("");
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

  // Common card style
  const cardStyle = {
    marginBottom: "20px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    padding: "12px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
  };

  return (
    <div className="app-container" style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{ width: "300px", padding: "10px", background: "#f4f4f4", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        
        {/* Add Member */}
        <div style={cardStyle}>
          <h4>👤 Add Member</h4>
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ width: "100%", padding: "6px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            style={{ width: "100%", padding: "6px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="colleague">Colleague</option>
            <option value="other">Other</option>
          </select>
          <button onClick={addMember} style={{ ...buttonStyle, background: "#4CAF50", color: "#fff" }}>Add</button>
        </div>

        {/* Members */}
        {/* Members */}
        <div style={cardStyle}>
          <h4>Members</h4>
          {people.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px",
                marginBottom: "8px",
                borderRadius: "6px",
                background: "#f9f9f9",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {/* Member info */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: groupColors[p.group] || "#ccc",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span>{p.name}</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => {
                    const name = prompt("Enter new name:", p.name);
                    const group = prompt("Enter group:", p.group);
                    if (name) editMember(p.id, name, group || p.group);
                  }}
                  style={{ ...buttonStyle, background: "#4CAF50", color: "#fff", padding: "4px 8px" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMember(p.id)}
                  style={{ ...buttonStyle, background: "#F44336", color: "#fff", padding: "4px 8px" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>


        {/* Add Relationship */}
        <div style={cardStyle}>
          <h4>🔗 Add Relationship</h4>
          <select value={relFrom} onChange={(e) => setRelFrom(e.target.value)} style={{ width: "100%", padding: "6px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #ccc" }}>
            <option value="">From</option>
            {people.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <select value={relTo} onChange={(e) => setRelTo(e.target.value)} style={{ width: "100%", padding: "6px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #ccc" }}>
            <option value="">To</option>
            {people.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <input type="text" placeholder="Relationship" value={relLabel} onChange={(e) => setRelLabel(e.target.value)} style={{ width: "100%", padding: "6px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #ccc" }} />
          <button onClick={addRelationship} style={{ ...buttonStyle, background: "#2196F3", color: "#fff" }}>Add</button>
        </div>

        {/* Export */}
        <div style={cardStyle}>
          <h4>💾 Export</h4>
          <button onClick={downloadImage} style={{ ...buttonStyle, background: "#2196F3", color: "#fff", marginBottom: "6px" }}>Download Image</button>
          <button onClick={downloadPDF} style={{ ...buttonStyle, background: "#FF5722", color: "#fff" }}>Download PDF</button>
        </div>
      </div>

      {/* NETWORK */}
      <div ref={containerRef} style={{ flex: 1, background: "#fff", height: "100%" }}></div>
    </div>
  );
}
