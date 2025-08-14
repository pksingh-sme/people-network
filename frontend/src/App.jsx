import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function FamilyFriendsNetwork() {
  const [people, setPeople] = useState([
    { id: 1, name: "Alice", group: "family" },
    { id: 2, name: "Bob", group: "friend" },
  ]);
  const [relations, setRelations] = useState([]);
  const [newPerson, setNewPerson] = useState({ name: "", group: "family" });
  const [relationForm, setRelationForm] = useState({ from: "", to: "", label: "" });
  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const groupColors = {
    family: "#ff9999",
    friend: "#99ccff",
    work: "#99ff99",
    other: "#cccccc",
  };

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
        edges: { arrows: "to", font: { align: "middle" } },
        interaction: { hover: true },
        physics: { enabled: true },
      }
    );

    networkRef.current = network;
  }, [people, relations]);

  const addPerson = () => {
    if (!newPerson.name) return;
    setPeople([...people, { id: Date.now(), ...newPerson }]);
    setNewPerson({ name: "", group: "family" });
  };

  const deletePerson = (id) => {
    setPeople(people.filter((p) => p.id !== id));
    setRelations(relations.filter((r) => r.from !== id && r.to !== id));
  };

  const updatePerson = (id, updatedData) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));
  };

  const addRelation = () => {
    if (!relationForm.from || !relationForm.to || !relationForm.label) return;
    setRelations([
      ...relations,
      { from: parseInt(relationForm.from), to: parseInt(relationForm.to), label: relationForm.label },
    ]);
    setRelationForm({ from: "", to: "", label: "" });
  };

  const downloadAsImage = async () => {
    const canvas = await html2canvas(containerRef.current);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "network.png";
    link.click();
  };

  const downloadAsPDF = async () => {
    const canvas = await html2canvas(containerRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.addImage(imgData, "PNG", 10, 10, 280, 190);
    pdf.save("network.pdf");
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Left Panel */}
      <div style={{ width: "300px" }}>
        <h2>Members</h2>
        <div>
          <input
            placeholder="Name"
            value={newPerson.name}
            onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
          />
          <select
            value={newPerson.group}
            onChange={(e) => setNewPerson({ ...newPerson, group: e.target.value })}
          >
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
          <button onClick={addPerson}>Add</button>
        </div>

        <ul style={{ padding: 0, listStyle: "none" }}>
          {people.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <span style={{ background: groupColors[p.group], padding: "3px 6px", borderRadius: "4px" }}>
                {p.name}
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value === "edit") {
                    const newName = prompt("Enter new name:", p.name);
                    if (newName) updatePerson(p.id, { name: newName });
                  } else if (e.target.value === "delete") {
                    deletePerson(p.id);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">⋮</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
              </select>
            </li>
          ))}
        </ul>

        <h3>Add Relationship</h3>
        <select
          value={relationForm.from}
          onChange={(e) => setRelationForm({ ...relationForm, from: e.target.value })}
        >
          <option value="">From</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={relationForm.to}
          onChange={(e) => setRelationForm({ ...relationForm, to: e.target.value })}
        >
          <option value="">To</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Relation"
          value={relationForm.label}
          onChange={(e) => setRelationForm({ ...relationForm, label: e.target.value })}
        />
        <button onClick={addRelation}>Add</button>

        <h3>Export</h3>
        <button onClick={downloadAsImage}>Download PNG</button>
        <button onClick={downloadAsPDF}>Download PDF</button>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1 }}>
        <div ref={containerRef} style={{ height: "600px", border: "1px solid gray" }}></div>
      </div>
    </div>
  );
}
