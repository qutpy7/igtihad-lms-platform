import serverless from 'serverless-http';
import { app } from '../../src/index';

// Wrap the Express app with serverless-http
const handler = serverless(app);

export { handler };
