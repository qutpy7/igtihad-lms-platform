import { Response } from 'express';

interface SSEClient {
    id: number;
    res: Response;
}

let clients: SSEClient[] = [];
let clientId = 0;

export const sseMiddleware = (req: any, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const id = ++clientId;
    clients.push({ id, res });

    // Send initial heartbeat
    res.write('data: {"type":"connected"}\n\n');

    req.on('close', () => {
        clients = clients.filter(c => c.id !== id);
    });
};

export const notifyClients = (table: string) => {
    const message = JSON.stringify({ type: 'update', table });
    clients.forEach(client => {
        client.res.write(`data: ${message}\n\n`);
    });
};

// Send a heartbeat ping every 30 seconds to keep connections alive
setInterval(() => {
    const message = JSON.stringify({ type: 'ping' });
    clients.forEach(client => {
        client.res.write(`data: ${message}\n\n`);
    });
}, 30000);
