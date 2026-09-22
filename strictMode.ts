const scoreByPlayer: Record<string, number> = {
  nick: 42,
  alex: 17,
};

function getScore(player: string): number {
  const score = scoreByPlayer[player];
  if (score === undefined) {
    throw new Error(`Unknown player: ${player}`);
  }
  return score;
}

const queue: string[] = ["first", "second"];

function processQueue(): string {
  const item = queue.shift();
  if (item === undefined) {
    throw new Error("Queue is empty");
  }
  return item;
}

interface UserDraft {
  name: string;
  nickname?: string;
}

function buildUser(name: string, nickname: string | undefined): UserDraft {
  return {
    name,
    ...(nickname !== undefined ? { nickname } : {}),
  };
}

function hasNickname(user: UserDraft): boolean {
  return "nickname" in user;
}

export { getScore, processQueue, buildUser, hasNickname };
export type { UserDraft };
