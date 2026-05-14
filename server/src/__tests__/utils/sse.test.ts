import { Response } from 'express';

describe('SSE Utils', () => {
    let mockReq1: any;
    let mockReq2: any;
    let mockRes1: any;
    let mockRes2: any;
    let req1CloseCallback: () => void;
    let req2CloseCallback: () => void;
    let sseMiddleware: any;
    let notifyClients: any;

    beforeAll(async () => {
        jest.useFakeTimers();
        const sse = await import('../../../src/utils/sse');
        sseMiddleware = sse.sseMiddleware;
        notifyClients = sse.notifyClients;
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        mockReq1 = {
            on: jest.fn((event, callback) => {
                if (event === 'close') {
                    req1CloseCallback = callback;
                }
            }),
        };

        mockReq2 = {
            on: jest.fn((event, callback) => {
                if (event === 'close') {
                    req2CloseCallback = callback;
                }
            }),
        };

        mockRes1 = {
            setHeader: jest.fn(),
            write: jest.fn(),
        };

        mockRes2 = {
            setHeader: jest.fn(),
            write: jest.fn(),
        };
    });

    afterEach(() => {
        // Disconnect all clients to clean up state for the next test
        if (req1CloseCallback) req1CloseCallback();
        if (req2CloseCallback) req2CloseCallback();
        req1CloseCallback = undefined as any;
        req2CloseCallback = undefined as any;
        jest.clearAllMocks();
    });

    it('should connect a client and send initial heartbeat', () => {
        sseMiddleware(mockReq1, mockRes1 as unknown as Response);

        expect(mockRes1.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
        expect(mockRes1.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
        expect(mockRes1.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
        expect(mockRes1.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');

        expect(mockRes1.write).toHaveBeenCalledWith('data: {"type":"connected"}\n\n');
    });

    it('should notify all connected clients', () => {
        sseMiddleware(mockReq1, mockRes1 as unknown as Response);
        sseMiddleware(mockReq2, mockRes2 as unknown as Response);

        // Clear initial connection writes
        mockRes1.write.mockClear();
        mockRes2.write.mockClear();

        notifyClients('users');

        expect(mockRes1.write).toHaveBeenCalledWith('data: {"type":"update","table":"users"}\n\n');
        expect(mockRes2.write).toHaveBeenCalledWith('data: {"type":"update","table":"users"}\n\n');
    });

    it('should remove a client when connection closes', () => {
        sseMiddleware(mockReq1, mockRes1 as unknown as Response);
        sseMiddleware(mockReq2, mockRes2 as unknown as Response);

        mockRes1.write.mockClear();
        mockRes2.write.mockClear();

        // Simulate client 1 disconnecting
        req1CloseCallback();

        notifyClients('posts');

        expect(mockRes1.write).not.toHaveBeenCalled();
        expect(mockRes2.write).toHaveBeenCalledWith('data: {"type":"update","table":"posts"}\n\n');
    });

    it('should send a heartbeat ping every 30 seconds to connected clients', () => {
        sseMiddleware(mockReq1, mockRes1 as unknown as Response);

        mockRes1.write.mockClear();

        jest.advanceTimersByTime(30000);

        expect(mockRes1.write).toHaveBeenCalledWith('data: {"type":"ping"}\n\n');
    });
});
