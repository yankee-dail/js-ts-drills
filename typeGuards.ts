type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number };

function isCircle(shape: Shape): shape is Extract<Shape, { kind: "circle" }> {
  return shape.kind === "circle";
}

function area(shape: Shape): number {
  if (isCircle(shape)) {
    return Math.PI * shape.radius ** 2;
  }
  if (shape.kind === "square") {
    return shape.side ** 2;
  }
  return shape.width * shape.height;
}

const ROLES = ["admin", "editor", "viewer"] as const;
type Role = (typeof ROLES)[number];

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

const routePermissions = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
} satisfies Record<Role, string[]>;

function createId(prefix: string): string {
  return `${prefix}-${createId.counter++}`;
}

namespace createId {
  export let counter = 0;
}

interface Config {
  timeout: number;
}

interface Config {
  retries: number;
}

const config: Config = {
  timeout: 3000,
  retries: 3,
};

declare global {
  interface Array<T> {
    last(): T | undefined;
  }
}

Array.prototype.last = function <T>(this: T[]): T | undefined {
  return this[this.length - 1];
};

export { isCircle, isRole, area, routePermissions, createId, config };
export type { Shape, Role, Config };
