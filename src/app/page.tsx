"use client";

import { useEffect, useState } from "react";
import { DataConnection, Peer } from "peerjs";
import { Button, Input, Space } from "antd";

let peer: Peer | null = null;

export default function Home() {
  const [id, setId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [deviceList, setDeviceList] = useState<DataConnection[]>([]);

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
      console.log(`target ${targetId} connection opend`);
    });
    setDeviceList([connection, ...deviceList]);
  };

  return (
    <div className="p-10">
      <Space direction="vertical">
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

        <Space.Compact>
          <Input addonBefore="Message" style={{ width: 480 }} />
          <Button type="primary" onClick={peerInit}>
            Send
          </Button>
        </Space.Compact>
      </Space>
      {/* <Space direction="vertical">
        {deviceList.map((deviceId, index) => (
          <>{deviceId}</>
        ))}
      </Space> */}
    </div>
  );
}
