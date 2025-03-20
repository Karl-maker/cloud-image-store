import { Space } from "../entities/space";

export type SpaceShareType = 'invite' | 'public' | 'private';
export type SpaceSortBy = Omit<Space, 'id'>;
export type SpaceFilterBy = Omit<Space, 'id' | 'totalMegabytes' | 'usedMegabytes' | 'deactivatedAt' | 'pausedAt'>;
export type SpaceCreatedEvent = {
    space: Space;
};