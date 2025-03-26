import { Persistent } from "./persistent";

export interface Notification extends Persistent {
    type: NotificationTypes;
    message: string;
}

export type NotificationTypes = 'system' | 'user';