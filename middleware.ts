// Re-export the proxy middleware — Next.js requires the file to be named
// `middleware.ts` at the project root.
export { proxy as middleware, config } from "./proxy";
