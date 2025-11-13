// src/components/MyFooter.jsx
import React from "react";
import { Layout, Typography } from "antd";

const { Footer } = Layout;
const { Text } = Typography;

export default function MyFooter() {
  return (
    <Footer
      style={{
        backgroundColor: "#f5f5f5",
        padding: "8px 16px",
        marginTop: "auto",
        textAlign: "center",
        borderTop: "1px solid #ddd",
      }}
    >
      <Text type="secondary" style={{ fontSize: 12 }}>
        Claro Nicaragua - Gerencia Implantación
      </Text>
    </Footer>
  );
}
