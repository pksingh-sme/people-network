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
  const [relations, setRelations] = useState([
    { from: 1, to: 2, label: "Sister" },
  ]);
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

    const network = new Network(
      containerRef.current,
      { nodes, edges },
      {
        edges: { arrows: "to" },
        interaction: { hover: true },
        physics: { enabled: true },
      }
    );

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

  // Edit member name/group
  const editMember = (id, newName, newGroup) => {
    setPeople(
      people.map((p) =>
        p.id === id ? { ...p, name: newName, group: newGroup } : p
      )
    );
  };

  // Add relationship
  const addRelationship = () => {
    if (!relFrom || !relTo || !relLabel) return;
    setRelations([
      ...relations,
      { from: parseInt(relFrom), to: parseInt(relTo), label: relLabel },
    ]);
    setRelFrom("");
    setRelTo("");
    setRelLabel("");
  };

  // Download as Image
  const downloadImage = async () => {
    const canvas = await html2canvas(containerRef.current);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "network.png";
    link.click();
  };

  // Download as PDF
  const downloadPDF = async () => {
    const canvas = await html2canvas(containerRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape");
    pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
    pdf.save("network.pdf");
  };

  return (
    <div className="app-container" style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div
        className="left-panel"
        style={{
          width: "300px",
          padding: "10px",
          background: "#f4f4f4",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
        }}
      >
        <h3>Actions</h3>

        {/* Add Member */}
        <div style={{ marginBottom: "20px" }}>
          <h4>Add Member</h4>
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
          >
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="colleague">Colleague</option>
            <option value="other">Other</option>
          </select>
          <button onClick={addMember}>Add</button>
        </div>

        {/* Manage Members */}
        <div>
          <h4>Members</h4>
          {people.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <span>{p.name}</span>
              <select
                onChange={(e) => {
                  if (e.target.value === "delete") {
                    deleteMember(p.id);
                  } else if (e.target.value === "edit") {
                    const name = prompt("Enter new name:", p.name);
                    const group = prompt("Enter group:", p.group);
                    if (name) editMember(p.id, name, group || p.group);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">Action</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          ))}
        </div>

        {/* Add Relationship */}
        <div style={{ marginTop: "20px" }}>
          <h4>Add Relationship</h4>
          <select value={relFrom} onChange={(e) => setRelFrom(e.target.value)}>
            <option value="">From</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select value={relTo} onChange={(e) => setRelTo(e.target.value)}>
            <option value="">To</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Relationship"
            value={relLabel}
            onChange={(e) => setRelLabel(e.target.value)}
          />
          <button onClick={addRelationship}>Add</button>
        </div>

        {/* Download */}
        <div style={{ marginTop: "20px" }}>
          <h4>Export</h4>
          <button onClick={downloadImage}>Download as Image</button>
          <button onClick={downloadPDF}>Download as PDF</button>
        </div>
      </div>

      {/* RIGHT PANEL - Graph */}
      <div
        ref={containerRef}
        style={{ flex: 1, background: "#fff", height: "100%" }}
      ></div>
    </div>
  );
}
