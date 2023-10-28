"use client";

import { useEffect, useState } from "react";
import { DataConnection, Peer } from "peerjs";
import { Button, Col, Input, Row, Space, notification } from "antd";

let peer: Peer | null = null;

export default function Home() {
  const [id, setId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [connectionList, setConnectionList] = useState<DataConnection[]>([]);

  const [initLoading, setInitLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const peerInit = () => {
    setInitLoading(true);
    if (!navigator) {
      setInitLoading(false);
      return;
    }

    peer = new Peer();

    peer.on("open", (id) => {
      setId(id);
      setInitLoading(false);
    });

    peer.on("connection", (connection) => {
      console.log(connection);

      connection.on("data", (data) => {
        console.log(data);
      });

      connection.on("close", () => {
        setConnectionList(
          connectionList.filter((conn) => conn.peer == connection.peer)
        );
        notification.info({
          message: "Device Disconnected",
          description: `ID: ${connection.peer}`,
        });
      });

      connection.on("error", (error) => {
        console.error(error);
        notification.error({
          message: "Connection Error",
          description: error.message,
        });
      });

      setConnectionList([connection, ...connectionList]);
      notification.info({
        message: `Device Connected`,
        description: `ID: ${connection.peer}`,
      });
    });
  };

  const connectDevice = () => {
    setConnecting(true);
    if (!peer) {
      setConnecting(false);
      return;
    }
    console.log(targetId);
    const connection = peer.connect(targetId);
    connection.on("open", () => {
      setConnecting(false);
      notification.success({
        message: `Device Connected`,
        description: `ID: ${targetId}`,
      });
      console.log(`target ${targetId} connection opend`);
    });
    setConnectionList([connection, ...connectionList]);
  };

  const sendMessage = () => {
    const target = connectionList[0];

    target.send({
      type: "message",
      data: {
        message,
      },
    });
  };

  return (
    <Row>
      <Col span={12}>
        <Space direction="vertical" className="p-10">
          <Space.Compact>
            <Input addonBefore="Device ID" value={id} style={{ width: 480 }} />
            <Button type="primary" onClick={peerInit} loading={initLoading}>
              Get
            </Button>
          </Space.Compact>

          <Space.Compact>
            <Input
              addonBefore="Target ID"
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
              }}
              style={{ width: 480 }}
            />
            <Button
              type="primary"
              onClick={connectDevice}
              loading={connecting}
              disabled={!peer}
            >
              Connect
            </Button>
          </Space.Compact>

          <Space direction="vertical">
            {connectionList.map(({ peer }, index) => (
              <div key={index}>{peer}</div>
            ))}
          </Space>
        </Space>
      </Col>

      <Col span={12}>
        <Space direction="vertical" className="p-10">
          <Input.TextArea
            placeholder="Type something here..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          <Button type="primary" onClick={sendMessage}>
            Send
          </Button>
        </Space>
      </Col>
    </Row>
  );
}
