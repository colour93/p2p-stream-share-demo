import { DataConnection } from "peerjs";

export interface Message {
  sender: DataConnection;
  message: string;
  time: Date;
}
