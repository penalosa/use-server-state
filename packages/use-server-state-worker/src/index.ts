import { DurableObject } from 'cloudflare:workers';

interface Env {
	STATE_STORE: DurableObjectNamespace<StateStore>;
}

export class StateStore extends DurableObject<Env> {
	fetch() {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: string) {
		const { value, initial } = JSON.parse(message);
		console.log(value, initial);
		if (initial) {
			const currentStoredValue = await this.ctx.storage.get<{ value: unknown }>('store');
			if (currentStoredValue !== undefined) ws.send(JSON.stringify({ value: currentStoredValue.value }));
			return;
		} else {
			await this.ctx.storage.put('store', { value });
			for (const w of this.ctx.getWebSockets()) {
				if (w !== ws) {
					w.send(JSON.stringify({ value }));
				}
			}
		}
	}
}

export default {
	async fetch(request, env): Promise<Response> {
		let id: DurableObjectId = env.STATE_STORE.idFromName(new URL(request.url).pathname);

		let stub = env.STATE_STORE.get(id);

		return stub.fetch(request);
	},
} satisfies ExportedHandler<Env>;
