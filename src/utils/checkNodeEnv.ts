/**
 * Checks for Node Environment
 * @param env Environment to be checked
 */
export function checkNodeEnv(env: NodeJS.ProcessEnv["NODE_ENV"]): boolean {
  return process.env.NODE_ENV === env;
}

export default checkNodeEnv;
