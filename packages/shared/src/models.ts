/**
 * Domain model shapes shared between the API and the UI. All timestamps are UTC
 * ISO strings; conversion to local time happens only at the UI boundary.
 */

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  dueAt: string | null;
  completedAt: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}
