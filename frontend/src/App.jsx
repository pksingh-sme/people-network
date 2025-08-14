import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "vis-network/styles/vis-network.css";

export default function FamilyFriendsNetwork() {
  const [people, setPeople] = useState([
    { id: 1, name: "Pramod", group: "family", age: 32, dob: "1991-01-01", phone: "1234567890", email: "pramod@example.com", profession: "Engineer", organization: "Twise" },
    { id: 2, name: "Harendra", group: "friend", age: 30, dob: "1993-02-15", phone: "9876543210", email: "harendra@example.com", profession: "Designer", organization: "Freelance" },
  ]);

  const [relations, setRelations] = useState([{ from: 1, to: 2, label: "Friend" }]);
  
  // Member form states
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("family");
  const [newAge, setNewAge] = useState("");
  const [newDOB, setNewDOB] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newProfession, setNewProfession] = useState("");
  const [newOrganization, setNewOrganization] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);

  const [relFrom, setRelFrom] = useState("");
  const [relTo, setRelTo] = useState("");
  const [relLabel, setRelLabel] = useState("");
  const [hoverCanvas, setHoverCanvas] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);

  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const groupColors = {
    family: "#ff9999",
    friend: "#99ccff",
    colleague: "#99ff99",
    other: "#cccccc",
  };

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

  const inputStyle = {
    width: "100%",
    padding: "6px",
    marginBottom: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const memberCardStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "6px",
    background: "#f9f9f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  // Build & render network
  useEffect(() => {
    if (!containerRef.current) return;

    const filteredNodes = selectedMemberId
      ? people.filter(p => {
          return p.id === selectedMemberId || 
                 relations.some(r => (r.from === selectedMemberId && r.to === p.id) || (r.to === selectedMemberId && r.from === p.id));
        })
      : people;

    const filteredEdges = selectedMemberId
      ? relations.filter(r => r.from === selectedMemberId || r.to === selectedMemberId)
      : relations;

    const nodes = new DataSet(
      filteredNodes.map((p) => ({
        id: p.id,
        label: p.name,
        color: groupColors[p.group] || "#ccc",
      }))
    );

    const edges = new DataSet(filteredEdges);

    const network = new Network(containerRef.current, { nodes, edges }, {
      edges: { arrows: "to" },
      interaction: { hover: true },
      physics: { enabled: true },
    });

    network.on("click", function (params) {
      if (params.nodes.length) {
        const nodeId = params.nodes[0];
        const member = people.find(p => p.id === nodeId);
        setMemberDetails(member);
      } else {
        setMemberDetails(null);
      }
    });

    networkRef.current = network;
  }, [people, relations, selectedMemberId]);

  const addOrUpdateMember = () => {
    if (!newName.trim()) return;

    if (editingMemberId) {
      // Update existing member
      setPeople(people.map(p => p.id === editingMemberId ? {
        ...p,
        name: newName,
        group: newGroup,
        age: newAge,
        dob: newDOB,
        phone: newPhone,
        email: newEmail,
        profession: newProfession,
        organization: newOrganization
      } : p));
      setEditingMemberId(null);
    } else {
      // Add new member
      const id = people.length ? Math.max(...people.map((p) => p.id)) + 1 : 1;
      setPeople([...people, { 
        id, name: newName, group: newGroup, age: newAge, dob: newDOB, phone: newPhone, email: newEmail,
        profession: newProfession, organization: newOrganization
      }]);
    }

    // Reset form
    setNewName(""); setNewGroup("family"); setNewAge(""); setNewDOB(""); setNewPhone(""); setNewEmail(""); setNewProfession(""); setNewOrganization("");
  };

  const deleteMember = (id) => {
    setPeople(people.filter((p) => p.id !== id));
    setRelations(relations.filter((r) => r.from !== id && r.to !== id));
    if (selectedMemberId === id) setSelectedMemberId(null);
    if (memberDetails?.id === id) setMemberDetails(null);
    if (editingMemberId === id) setEditingMemberId(null);
  };

  const addRelationship = () => {
    if (!relFrom || !relTo || !relLabel) return;
    setRelations([...relations, { from: parseInt(relFrom), to: parseInt(relTo), label: relLabel }]);
    setRelFrom(""); setRelTo(""); setRelLabel("");
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
    pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
    pdf.save("network.pdf");
  };

  const startEditMember = (member) => {
    setEditingMemberId(member.id);
    setNewName(member.name);
    setNewGroup(member.group);
    setNewAge(member.age || "");
    setNewDOB(member.dob || "");
    setNewPhone(member.phone || "");
    setNewEmail(member.email || "");
    setNewProfession(member.profession || "");
    setNewOrganization(member.organization || "");
  };

  return (
    <div className="app-container" style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{ width: "300px", padding: "10px", background: "#f4f4f4", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        
        {/* Add/Edit Member */}
        <div style={cardStyle}>
          <h4>👤 {editingMemberId ? "Edit Member" : "Add Member"}</h4>
          <input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
          <select value={newGroup} onChange={(e) => setNewGroup(e.target.value)} style={inputStyle}>
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="colleague">Colleague</option>
            <option value="other">Other</option>
          </select>
          <input type="number" placeholder="Age" value={newAge} onChange={(e) => setNewAge(e.target.value)} style={inputStyle} />
          <input type="date" placeholder="DOB" value={newDOB} onChange={(e) => setNewDOB(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} style={inputStyle} />
          <input type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Profession" value={newProfession} onChange={(e) => setNewProfession(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Organization" value={newOrganization} onChange={(e) => setNewOrganization(e.target.value)} style={inputStyle} />
          <button onClick={addOrUpdateMember} style={{ ...buttonStyle, background: "#4CAF50", color: "#fff" }}>{editingMemberId ? "Update" : "Add"}</button>
        </div>

        {/* Add Relationship */}
        <div style={cardStyle}>
          <h4>🔗 Add Relationship</h4>
          <select value={relFrom} onChange={(e) => setRelFrom(e.target.value)} style={inputStyle}>
            <option value="">From</option>
            {people.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <select value={relTo} onChange={(e) => setRelTo(e.target.value)} style={inputStyle}>
            <option value="">To</option>
            {people.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <input type="text" placeholder="Relationship" value={relLabel} onChange={(e) => setRelLabel(e.target.value)} style={inputStyle} />
          <button onClick={addRelationship} style={{ ...buttonStyle, background: "#2196F3", color: "#fff" }}>Add</button>
        </div>

        {/* Members List */}
        <div style={cardStyle}>
          <h4>📋 Members</h4>
          {people.map((p) => (
            <div key={p.id} style={memberCardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: groupColors[p.group] || "#ccc", borderRadius: "50%" }}></div>
                <span>{p.name}</span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => startEditMember(p)} style={{ ...buttonStyle,  color: "#fff", padding: "4px 2px" }}>✏️</button>
                <button onClick={() => setSelectedMemberId(p.id)} style={{ ...buttonStyle, color: "#fff", padding: "4px 2px" }}>🔗</button>
                <button onClick={() => deleteMember(p.id)} style={{ ...buttonStyle,  color: "#fff", padding: "4px 2px" }}>🗑️</button>
              </div>
            </div>
          ))}
          {selectedMemberId && (
            <button onClick={() => setSelectedMemberId(null)} style={{ ...buttonStyle, background: "#2196F3", color: "#fff" }}>Reset Network</button>
          )}
        </div>
      </div>

      {/* NETWORK */}
      <div 
        ref={containerRef} 
        style={{ flex: 1, position: "relative", background: "#fff", height: "100%" }}
        onMouseEnter={() => setHoverCanvas(true)}
        onMouseLeave={() => setHoverCanvas(false)}
      >
        {/* Floating Export Panel */}
        {hoverCanvas && (
          <div style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#fff",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 10,
          }}>
            <button onClick={downloadImage} style={{ ...buttonStyle, background: "#2196F3", color: "#fff", marginBottom: "6px" }}>Download Image</button>
            <button onClick={downloadPDF} style={{ ...buttonStyle, background: "#FF5722", color: "#fff" }}>Download PDF</button>
          </div>
        )}

        {/* Member Details Panel */}
        {memberDetails && (
          <div style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            width: "280px",
            background: "#fff",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 10,
          }}>
            <h4>{memberDetails.name}</h4>
            <p><strong>Group:</strong> {memberDetails.group}</p>
            <p><strong>Age:</strong> {memberDetails.age}</p>
            <p><strong>DOB:</strong> {memberDetails.dob}</p>
            <p><strong>Phone:</strong> {memberDetails.phone}</p>
            <p><strong>Email:</strong> {memberDetails.email}</p>
            <p><strong>Profession:</strong> {memberDetails.profession}</p>
            <p><strong>Organization:</strong> {memberDetails.organization}</p>
          </div>
        )}
      </div>
    </div>
  );
}
