import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function App() {
  const [people, setPeople] = useState([
    { id: 1, name: "Alice", group: "Family" },
    { id: 2, name: "Bob", group: "Friend" }
  ]);
  const [relations, setRelations] = useState([
    { from: 1, to: 2, label: "Friend" }
  ]);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("Family");
  const [relationFrom, setRelationFrom] = useState("");
  const [relationTo, setRelationTo] = useState("");
  const [relationLabel, setRelationLabel] = useState("");

  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const groupColors = {
    Family: "#ff9999",
    Friend: "#99ccff",
    Work: "#90ee90"
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = new DataSet(
      people.map(p => ({
        id: p.id,
        label: p.name,
        color: groupColors[p.group] || "#ccc"
      }))
    );

    const edges = new DataSet(relations);

    const network = new Network(containerRef.current, { nodes, edges }, {
      edges: { arrows: "to", font: { align: "middle" } },
      interaction: { hover: true },
      physics: { enabled: true }
    });

    networkRef.current = network;
  }, [people, relations]);

  const addPerson = () => {
    if (!newName.trim()) return;
    setPeople(prev => [
      ...prev,
      { id: Date.now(), name: newName, group: newGroup }
    ]);
    setNewName("");
  };

  const deletePerson = (id) => {
    setPeople(prev => prev.filter(p => p.id !== id));
    setRelations(prev => prev.filter(r => r.from !== id && r.to !== id));
  };

  const editPerson = (id) => {
    const newName = prompt("Enter new name:");
    if (newName) {
      setPeople(prev =>
        prev.map(p => (p.id === id ? { ...p, name: newName } : p))
      );
    }
  };

  const addRelation = () => {
    if (!relationFrom || !relationTo || !relationLabel) return;
    setRelations(prev => [
      ...prev,
      { from: parseInt(relationFrom), to: parseInt(relationTo), label: relationLabel }
    ]);
    setRelationFrom("");
    setRelationTo("");
    setRelationLabel("");
  };

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
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("network.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Family & Friends Network</h2>

      {/* Add Member */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Enter name"
        />
        <select value={newGroup} onChange={e => setNewGroup(e.target.value)}>
          <option>Family</option>
          <option>Friend</option>
          <option>Work</option>
        </select>
        <button onClick={addPerson}>Add</button>
      </div>

      {/* Add Relation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <select value={relationFrom} onChange={e => setRelationFrom(e.target.value)}>
          <option value="">From</option>
          {people.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={relationTo} onChange={e => setRelationTo(e.target.value)}>
          <option value="">To</option>
          {people.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          value={relationLabel}
          onChange={e => setRelationLabel(e.target.value)}
          placeholder="Relation label"
        />
        <button onClick={addRelation}>Add Relation</button>
      </div>

      {/* Member List */}
      <div>
        <h3>Members</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {people.map(p => (
            <li key={p.id} style={{
              background: groupColors[p.group] || "#ccc",
              padding: "6px",
              marginBottom: "4px",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>{p.name} ({p.group})</span>
              <div>
                <select onChange={(e) => {
                  if (e.target.value === "edit") editPerson(p.id);
                  if (e.target.value === "delete") deletePerson(p.id);
                  e.target.value = "";
                }}>
                  <option value="">Actions</option>
                  <option value="edit">Edit</option>
                  <option value="delete">Delete</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Graph */}
      <div ref={containerRef} style={{ height: "500px", border: "1px solid gray", marginTop: "15px" }}></div>

      {/* Download Buttons */}
      <div style={{ marginTop: "15px" }}>
        <button onClick={downloadImage}>Download as Image</button>
        <button onClick={downloadPDF} style={{ marginLeft: "10px" }}>Download as PDF</button>
      </div>
    </div>
  );
}
