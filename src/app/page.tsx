"use client";

import { useCallback, useEffect, useState } from "react";
import { DataConnection, Peer } from "peerjs";
import {
  Button,
  Col,
  Input,
  Row,
  Select,
  Space,
  notification,
  message,
} from "antd";
import { Message } from "@/types/ConnectionData/Message";
import { ConnectionData } from "@/types/ConnectionData";

let peer: Peer | null = null;

export default function Home() {
  const [id, setId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendTarget, setSendTarget] = useState<DataConnection | null>(null);
  const [connectionList, setConnectionList] = useState<DataConnection[]>([]);
  const [messageList, setMessageList] = useState<Message[]>([]);

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
      handleConnection(connection);
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
      handleConnection(connection);
      notification.success({
        message: `Device Connected`,
        description: `ID: ${targetId}`,
      });
    });
  };

  const sendMessage = () => {
    sendTarget?.send({
      type: "message",
      data: {
        message: messageContent,
      },
    });
  };

  const handleConnectionData = useCallback(
    (connection: DataConnection, rawData: unknown) => {
      const data = rawData as ConnectionData;

      switch (data.type) {
        case "message":
          setMessageList((prev) => [
            ...prev,
            {
              sender: connection,
              message: data.data.message,
              time: new Date(),
            },
          ]);
          break;

        default:
          console.error(data);
          notification.error({
            message: "Unknown Message Type",
            description: `Type: ${data.type}`,
          });
          return;
      }
    },
    [messageList]
  );

  const handleConnection = useCallback(
    (connection: DataConnection) => {
      connection.on("data", (data) => {
        handleConnectionData(connection, data);
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

      setConnectionList((prev) => [...prev, connection]);
    },
    [handleConnectionData, connectionList]
  );

  return (
    <Row>
      <Col span={12}>
        <Space direction="vertical" className="p-10">
          <Space.Compact>
            <Input addonBefore="Device ID" value={id} style={{ width: 360 }} />
            <Button type="primary" onClick={peerInit} loading={initLoading}>
              Get
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard
                  .writeText(id)
                  .then(() => {
                    message.success("Copy Succcess");
                  })
                  .catch((error) => {
                    console.error(error);
                    message.error("Copy failed");
                  });
              }}
            >
              Copy
            </Button>
          </Space.Compact>

          <Space.Compact>
            <Input
              addonBefore="Target ID"
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
              }}
              style={{ width: 360 }}
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

          <Select
            placeholder="Send Target"
            options={connectionList.map((v) => {
              return {
                value: v.peer,
                label: v.peer,
              };
            })}
            value={sendTarget?.peer}
            onChange={(v: string) => {
              setSendTarget(connectionList.filter((i) => i.peer == v)[0]);
            }}
            style={{ width: "100%" }}
          ></Select>
        </Space>
      </Col>

      <Col span={12}>
        <Space direction="vertical" className="p-10">
          <Space direction="vertical">
            <Input.TextArea
              placeholder="Type something here..."
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
              }}
              style={{ width: 360 }}
            />
            <Button type="primary" onClick={sendMessage}>
              Send
            </Button>
          </Space>

          <Space direction="vertical">
            {messageList.map((messageItem, index) => (
              <div key={index}>
                {messageItem.time.toLocaleString()} - {messageItem.sender.peer}:{" "}
                {messageItem.message}
              </div>
            ))}
          </Space>
        </Space>
      </Col>
    </Row>
  );
}
