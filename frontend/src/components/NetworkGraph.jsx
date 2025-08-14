import React, { useEffect, useRef } from "react";
import { Network } from "vis-network/standalone";

export default function NetworkGraph({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const options = {
      nodes: { shape: "dot", size: 16, font: { size: 14 } },
      edges: { font: { align: "top" }, color: { color: "#999" } },
      physics: { enabled: true, barnesHut: { gravitationalConstant: -2000, springLength: 150 } },
      interaction: { hover: true, tooltipDelay: 150 },
    };

    const network = new Network(containerRef.current, data, options);

    return () => network.destroy();
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{ height: "70vh", border: "1px solid #ddd", borderRadius: "8px" }}
    />
  );
}
