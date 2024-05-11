import { WebSocket } from "partysocket";
import ReconnectingWebSocket from "partysocket/ws";
import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * @template T
 * @param {T} initialValue - The initial value. This is ignored if the server already has a value for this property
 * @param {string} id - The remote identifier to discriminate between multiple calls
 * @returns {[T, (v: T) => void]}
 */
export function useServerState(initialValue, id = "demo-state-store") {
    const endpoint = useContext(ServerStateContext) ?? `wss://use-server-state-worker.s.workers.dev`;
    /**
     * @type {React.MutableRefObject<ReconnectingWebSocket>}
     */
    const socket = useRef(null)

    const [val, setVal] = useState(initialValue)

    useEffect(() => {
        socket.current = new WebSocket(`${endpoint}/${encodeURIComponent(id)}`);

        /**
         * @param {MessageEvent<string>} m 
         */
        socket.current.onmessage = m => {
            const { value } = JSON.parse(m.data)
            setVal(value)
        }

        socket.current.send(JSON.stringify({ initial: true }))
    }, [id])

    return [val, v => {
        setVal(v)
        socket.current.send(JSON.stringify({ value: (v) }))
    }]
}

/**
 * @type {React.Context<string>}
 */
export const ServerStateContext = createContext(null)