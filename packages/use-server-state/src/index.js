import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * @type {import("react").Context<string>}
 */
export const ServerStateContext = createContext(null);

/**
 * @template T
 * @param {T} initialValue - The initial value. This is ignored if the server already has a value for this property
 * @param {string} id - The remote identifier to discriminate between multiple calls
 * @returns {[T, (v: T) => void]}
 */
export function useServerState(initialValue, id = "demo-state-store") {
  const endpoint =
    useContext(ServerStateContext) ??
    `wss://use-server-state-worker.s.workers.dev`;
  /**
   * @type {import("react").MutableRefObject<WebSocket>}
   */
  const socket = useRef(null);

  const [val, setVal] = useState(initialValue);

  useEffect(() => {
    socket.current = new WebSocket(`${endpoint}/${encodeURIComponent(id)}`);

    /**
     * @param {MessageEvent<string>} m
     */
    socket.current.onmessage = (m) => {
      const { value } = JSON.parse(m.data);
      setVal(value);
    };
    socket.current.onopen = () => {
      if (socket.current.readyState === WebSocket.OPEN)
        socket.current.send(JSON.stringify({ initial: true }));
    };
  }, [id]);

  return [
    val,
    (v) => {
      setVal(v);
      if (socket.current.readyState === WebSocket.OPEN)
        socket.current.send(JSON.stringify({ value: v }));
    }
  ];
}
