import { createRequestHandler } from '@remix-run/netlify';
import * as serverBuild from '../../build';

export const handler = createRequestHandler({
  build: serverBuild as any,
  mode: process.env.NODE_ENV,
});


