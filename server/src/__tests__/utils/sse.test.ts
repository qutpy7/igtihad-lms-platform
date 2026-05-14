import { Response } from 'express';

describe('SSE Utils', () => {
    let sseMiddleware: any;
    let notifyClients: any;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.isolateModules(() => {
            const sse = require('../../utils/sse');
            sseMiddleware = sse.sseMiddleware;
            notifyClients = sse.notifyClients;
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('should set headers and send heartbeat on connection', () => {
        const req = { on: jest.fn() };
        const res = {
            setHeader: jest.fn(),
            write: jest.fn()
        } as unknown as Response;

        sseMiddleware(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
        expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');

        expect(res.write).toHaveBeenCalledWith('data: {"type":"connected"}\n\n');
        expect(req.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should notify all connected clients', () => {
        const req1 = { on: jest.fn() };
        const res1 = { setHeader: jest.fn(), write: jest.fn() } as unknown as Response;
        const req2 = { on: jest.fn() };
        const res2 = { setHeader: jest.fn(), write: jest.fn() } as unknown as Response;

        sseMiddleware(req1, res1);
        sseMiddleware(req2, res2);

        // Clear initial connection writes
        (res1.write as jest.Mock).mockClear();
        (res2.write as jest.Mock).mockClear();

        notifyClients('test_table');

        const expectedMessage = `data: {"type":"update","table":"test_table"}\n\n`;
        expect(res1.write).toHaveBeenCalledWith(expectedMessage);
        expect(res2.write).toHaveBeenCalledWith(expectedMessage);
    });

    it('should handle client disconnect', () => {
        let closeCallback: Function = () => {};
        const req = {
            on: jest.fn((event, cb) => {
                if (event === 'close') closeCallback = cb;
            })
        };
        const res = { setHeader: jest.fn(), write: jest.fn() } as unknown as Response;

        sseMiddleware(req, res);

        // Clear initial write
        (res.write as jest.Mock).mockClear();

        // Simulate disconnect
        closeCallback();

        // Notify should not write to disconnected client
        notifyClients('test_table');
        expect(res.write).not.toHaveBeenCalled();
    });

    it('should send periodic pings', () => {
        const req = { on: jest.fn() };
        const res = { setHeader: jest.fn(), write: jest.fn() } as unknown as Response;

        sseMiddleware(req, res);

        // Clear initial write
        (res.write as jest.Mock).mockClear();

        // Advance timers by 30 seconds
        jest.advanceTimersByTime(30000);

        expect(res.write).toHaveBeenCalledWith('data: {"type":"ping"}\n\n');
    });
});
