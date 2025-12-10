import { create } from 'zustand';
import type {
  CollaborationState,
  CollaborationUser,
  CoTherapySession,
  SharedTemplate,
  WorkflowRequest,
  ActivityLogEntry,
  UserPresence,
  SyncStatus,
  TemplateCategory,
  UserRole,
} from '@/types/collaboration';


interface CollaborationStore extends CollaborationState {
  // Initialization flag to prevent duplicate data loading
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;

  setCurrentUser: (user: CollaborationUser | null) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;

  startCoTherapy: (session: CoTherapySession) => void;
  endCoTherapy: () => void;
  addParticipant: (user: CollaborationUser) => void;
  removeParticipant: (userId: string) => void;
  updatePresence: (userId: string, presence: Partial<UserPresence>) => void;
  updateParticipantRole: (userId: string, newRole: string) => void;
  inviteUser: (email: string, role: string) => void;

  addSharedTemplate: (template: SharedTemplate) => void;
  updateTemplate: (id: string, updates: Partial<SharedTemplate>) => void;
  removeTemplate: (id: string) => void;
  incrementTemplateUsage: (id: string) => void;
  applyTemplate: (id: string) => string;
  customizeTemplate: (id: string, newContent: string, newName: string) => SharedTemplate;
  shareTemplate: (id: string, userIds: string[]) => void;
  createNewTemplate: (name: string, content: string, category: string, tags: string[]) => SharedTemplate;
  editTemplate: (id: string, updates: Partial<SharedTemplate>) => void;
  deleteTemplate: (id: string) => void;

  createWorkflow: (workflow: WorkflowRequest) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowRequest>) => void;
  approveWorkflow: (id: string, comment?: string) => void;
  rejectWorkflow: (id: string, reason: string) => void;
  markWorkflowRead: (id: string) => void;
  markAllWorkflowsRead: () => void;
  requestClarification: (id: string, message: string) => void;
  addWorkflowComment: (id: string, content: string) => void;
  editWorkflowComment: (workflowId: string, commentId: string, newContent: string) => void;
  deleteWorkflowComment: (workflowId: string, commentId: string) => void;

  inviteToSession: (userId: string, role: 'lead' | 'support' | 'observer') => void;
  updateSessionNotes: (notes: string) => void;
  kickFromSession: (userId: string) => void;

  // Activity log methods
  addActivity: (activity: ActivityLogEntry) => void;
  clearActivity: () => void;

  // Sync status methods
  updateSyncStatus: (status: Partial<SyncStatus>) => void;
  incrementPendingChanges: () => void;
  decrementPendingChanges: () => void;

  // Persistence methods
  loadFromStorage: () => void;
  saveToStorage: () => void;
  reset: () => void;
}


const initialState: CollaborationState = {
  currentUser: null,
  coTherapySession: null,
  participants: [],
  presenceData: {},
  sharedTemplates: [],
  workflows: [],
  unreadWorkflows: 0,
  recentActivity: [],
  syncStatus: {
    isConnected: false,
    pendingChanges: 0,
    conflictCount: 0,
  },
};

// Store-level flag to prevent duplicate initialization
const storeInitialState = {
  ...initialState,
  isInitialized: false,
};


const STORAGE_KEY = 'consulton.collaboration.state';


export const useCollaborationStore = create<CollaborationStore>((set, get) => ({
  ...storeInitialState,

  setInitialized: (value) => {
    set({ isInitialized: value });
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
    get().saveToStorage();
  },

  updateUserStatus: (userId, isOnline) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === userId ? { ...p, isOnline, lastSeen: new Date() } : p
      ),
    }));
  },


  startCoTherapy: (session) => {
    set({ coTherapySession: session });
    get().addActivity({
      id: crypto.randomUUID(),
      type: 'session_shared',
      userId: get().currentUser?.id || 'unknown',
      userName: get().currentUser?.name || 'Unknown',
      targetId: session.id,
      targetType: 'session',
      description: `Started co-therapy session`,
      timestamp: new Date(),
    });
    get().saveToStorage();
  },

  endCoTherapy: () => {
    const session = get().coTherapySession;
    if (session) {
      get().addActivity({
        id: crypto.randomUUID(),
        type: 'session_left',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: session.id,
        targetType: 'session',
        description: `Ended co-therapy session`,
        timestamp: new Date(),
      });
    }
    set({
      coTherapySession: null,
      participants: [],
      presenceData: {},
    });
    get().saveToStorage();
  },

  addParticipant: (user) => {
    set((state) => ({
      participants: [...state.participants.filter((p) => p.id !== user.id), user],
    }));
    get().addActivity({
      id: crypto.randomUUID(),
      type: 'session_joined',
      userId: user.id,
      userName: user.name,
      description: `${user.name} joined the session`,
      timestamp: new Date(),
    });
    get().saveToStorage();
  },

  removeParticipant: (userId) => {
    const user = get().participants.find((p) => p.id === userId);
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== userId),
      presenceData: Object.fromEntries(
        Object.entries(state.presenceData).filter(([key]) => key !== userId)
      ),
    }));
    if (user) {
      get().addActivity({
        id: crypto.randomUUID(),
        type: 'session_left',
        userId: user.id,
        userName: user.name,
        description: `${user.name} left the session`,
        timestamp: new Date(),
      });
    }
  },

  updatePresence: (userId, presence) => {
    set((state) => ({
      presenceData: {
        ...state.presenceData,
        [userId]: {
          ...state.presenceData[userId],
          ...presence,
          lastActivity: new Date(),
        },
      },
    }));
  },


  addSharedTemplate: (template) => {
    set((state) => {
      const exists = state.sharedTemplates.some((t) => t.id === template.id);
      const sharedTemplates = exists
        ? state.sharedTemplates.map((t) => (t.id === template.id ? template : t))
        : [...state.sharedTemplates, template];
      return { sharedTemplates };
    });
    get().addActivity({
      id: crypto.randomUUID(),
      type: 'template_created',
      userId: template.ownerId,
      userName: template.ownerName,
      targetId: template.id,
      targetType: 'template',
      description: `Created template "${template.name}"`,
      timestamp: new Date(),
    });
    get().saveToStorage();
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      sharedTemplates: state.sharedTemplates.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      ),
    }));
    get().saveToStorage();
  },

  removeTemplate: (id) => {
    set((state) => ({
      sharedTemplates: state.sharedTemplates.filter((t) => t.id !== id),
    }));
    get().saveToStorage();
  },

  incrementTemplateUsage: (id) => {
    set((state) => ({
      sharedTemplates: state.sharedTemplates.map((t) =>
        t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
      ),
    }));
    get().saveToStorage();
  },


  createWorkflow: (workflow) => {
    set((state) => {
      const index = state.workflows.findIndex((w) => w.id === workflow.id);
      let workflows: WorkflowRequest[];
      if (index >= 0) {
        const merged = { ...state.workflows[index], ...workflow } as WorkflowRequest;
        workflows = [...state.workflows];
        workflows[index] = merged;
      } else {
        workflows = [...state.workflows, workflow];
      }
      const unreadWorkflows = index >= 0 ? state.unreadWorkflows : state.unreadWorkflows + 1;
      return { workflows, unreadWorkflows };
    });
    get().addActivity({
      id: crypto.randomUUID(),
      type: 'workflow_created',
      userId: workflow.requesterId,
      userName: workflow.requesterName,
      targetId: workflow.id,
      targetType: 'workflow',
      description: `Created ${workflow.type} request: "${workflow.title}"`,
      timestamp: new Date(),
    });
    get().saveToStorage();
  },

  updateWorkflow: (id, updates) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
      ),
    }));
    get().saveToStorage();
  },

  approveWorkflow: (id, comment) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (workflow) {
      const newComment = comment ? {
        id: crypto.randomUUID(),
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        content: comment,
        timestamp: new Date(),
      } : undefined;

      get().updateWorkflow(id, {
        status: 'approved',
        completedAt: new Date(),
        comments: newComment ? [...workflow.comments, newComment] : workflow.comments,
      });

      get().addActivity({
        id: crypto.randomUUID(),
        type: 'workflow_approved',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: id,
        targetType: 'workflow',
        description: `Approved ${workflow.type} request`,
        timestamp: new Date(),
      });
    }
  },

  rejectWorkflow: (id, reason) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (workflow) {
      const rejectComment = {
        id: crypto.randomUUID(),
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        content: `Rejected: ${reason}`,
        timestamp: new Date(),
      };

      get().updateWorkflow(id, {
        status: 'rejected',
        completedAt: new Date(),
        comments: [...workflow.comments, rejectComment],
      });

      get().addActivity({
        id: crypto.randomUUID(),
        type: 'workflow_rejected',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: id,
        targetType: 'workflow',
        description: `Rejected ${workflow.type} request`,
        timestamp: new Date(),
      });
    }
  },

  markWorkflowRead: (_id) => {
    set((state) => ({
      unreadWorkflows: Math.max(0, state.unreadWorkflows - 1),
    }));
  },

  markAllWorkflowsRead: () => {
    set({ unreadWorkflows: 0 });
  },

  requestClarification: (id, message) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (workflow && message.trim()) {
      const clarificationComment = {
        id: crypto.randomUUID(),
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        content: `Clarification requested: ${message}`,
        timestamp: new Date(),
      };

      get().updateWorkflow(id, {
        comments: [...workflow.comments, clarificationComment],
      });

      get().addActivity({
        id: crypto.randomUUID(),
        type: 'workflow_updated',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: id,
        targetType: 'workflow',
        description: `Requested clarification on ${workflow.type}`,
        timestamp: new Date(),
      });
    }
  },

  addWorkflowComment: (id, content) => {
    const workflow = get().workflows.find((w) => w.id === id);
    if (workflow && content.trim()) {
      const newComment = {
        id: crypto.randomUUID(),
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        content: content.trim(),
        timestamp: new Date(),
      };

      get().updateWorkflow(id, {
        comments: [...workflow.comments, newComment],
      });

      get().addActivity({
        id: crypto.randomUUID(),
        type: 'comment_added',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: id,
        targetType: 'workflow',
        description: `Commented on ${workflow.type}`,
        timestamp: new Date(),
      });
    }
  },

  editWorkflowComment: (workflowId, commentId, newContent) => {
    const workflow = get().workflows.find((w) => w.id === workflowId);
    if (workflow && newContent.trim()) {
      const updatedComments = workflow.comments.map(comment =>
        comment.id === commentId && comment.userId === get().currentUser?.id
          ? { ...comment, content: newContent.trim(), edited: true }
          : comment
      );

      get().updateWorkflow(workflowId, {
        comments: updatedComments,
      });
    }
  },

  deleteWorkflowComment: (workflowId, commentId) => {
    const workflow = get().workflows.find((w) => w.id === workflowId);
    if (workflow) {
      const updatedComments = workflow.comments.filter(
        comment => !(comment.id === commentId && comment.userId === get().currentUser?.id)
      );

      get().updateWorkflow(workflowId, {
        comments: updatedComments,
      });
    }
  },

  applyTemplate: (id) => {
    const template = get().sharedTemplates.find((t) => t.id === id);
    if (template) {
      get().incrementTemplateUsage(id);
      get().addActivity({
        id: crypto.randomUUID(),
        type: 'template_applied',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: id,
        targetType: 'template',
        description: `Applied template: "${template.name}"`,
        timestamp: new Date(),
      });
      return template.content;
    }
    return '';
  },

  customizeTemplate: (id, newContent, newName) => {
    const original = get().sharedTemplates.find((t) => t.id === id);
    if (!original) throw new Error('Template not found');

    const customized: SharedTemplate = {
      id: crypto.randomUUID(),
      name: newName || `${original.name} (Custom)`,
      content: newContent,
      category: original.category,
      tags: [...original.tags, 'customized'],
      description: `Customized from: ${original.name}`,
      visibility: 'private',
      ownerId: get().currentUser?.id || 'unknown',
      ownerName: get().currentUser?.name || 'Unknown',
      ...(original.teamId ? { teamId: original.teamId } : {}),
      ...(original.organizationId ? { organizationId: original.organizationId } : {}),
      version: 1,
      versionHistory: [{
        version: 1,
        content: newContent,
        changedBy: get().currentUser?.id || 'unknown',
        changeDescription: 'Initial customization',
        timestamp: new Date(),
      }],
      ...(original.rating ? { rating: original.rating } : {}),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: [],
    };

    get().addSharedTemplate(customized);
    get().addActivity({
      id: crypto.randomUUID(),
      type: 'template_created',
      userId: get().currentUser?.id || 'unknown',
      userName: get().currentUser?.name || 'Unknown',
      targetId: customized.id,
      targetType: 'template',
      description: `Customized template: "${customized.name}"`,
      timestamp: new Date(),
    });

    return customized;
  },

  shareTemplate: (id, userIds) => {
    const template = get().sharedTemplates.find((t) => t.id === id);
    if (template && template.ownerId === get().currentUser?.id) {
      const newSharedWith = userIds.map(userId => ({
        userId,
        permissions: {
          canView: true,
          canEdit: false,
          canShare: false,
          canDelete: false,
        },
      }));

      get().updateTemplate(id, {
        sharedWith: [...template.sharedWith, ...newSharedWith],
        visibility: 'team',
      });

      get().addActivity({
        id: crypto.randomUUID(),
        type: 'template_shared',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: id,
        targetType: 'template',
        description: `Shared template with ${userIds.length} user(s)`,
        timestamp: new Date(),
      });
    }
  },

  createNewTemplate: (name, content, category, tags) => {
    const newTemplate: SharedTemplate = {
      id: crypto.randomUUID(),
      name: name.trim(),
      content: content.trim(),
      category: category as TemplateCategory || 'note',
      tags: tags || [],
      visibility: 'private',
      ownerId: get().currentUser?.id || 'unknown',
      ownerName: get().currentUser?.name || 'Unknown',
      version: 1,
      versionHistory: [{
        version: 1,
        content: content.trim(),
        changedBy: get().currentUser?.id || 'unknown',
        changeDescription: 'Initial version',
        timestamp: new Date(),
      }],
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: [],
    };

    get().addSharedTemplate(newTemplate);
    get().addActivity({
      id: crypto.randomUUID(),
      type: 'template_created',
      userId: get().currentUser?.id || 'unknown',
      userName: get().currentUser?.name || 'Unknown',
      targetId: newTemplate.id,
      targetType: 'template',
      description: `Created template: "${newTemplate.name}"`,
      timestamp: new Date(),
    });

    return newTemplate;
  },

  editTemplate: (id, updates) => {
    const template = get().sharedTemplates.find((t) => t.id === id);
    if (template && template.ownerId === get().currentUser?.id) {
      get().updateTemplate(id, {
        ...updates,
        version: (template.version || 1) + 1,
        updatedAt: new Date(),
      });

      get().addActivity({
        id: crypto.randomUUID(),
        type: 'template_updated',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: id,
        targetType: 'template',
        description: `Updated template: "${template.name}"`,
        timestamp: new Date(),
      });
    }
  },

  deleteTemplate: (id) => {
    const template = get().sharedTemplates.find((t) => t.id === id);
    if (template && template.ownerId === get().currentUser?.id) {
      get().removeTemplate(id);
      get().addActivity({
        id: crypto.randomUUID(),
        type: 'template_deleted',
        userId: get().currentUser?.id || 'unknown',
        userName: get().currentUser?.name || 'Unknown',
        targetId: id,
        targetType: 'template',
        description: `Deleted template: "${template.name}"`,
        timestamp: new Date(),
      });
    }
  },

  updateParticipantRole: (userId, newRole) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === userId ? { ...p, role: newRole as UserRole } : p
      ),
    }));
    get().addActivity({
      id: crypto.randomUUID(),
      type: 'user_updated',
      userId: get().currentUser?.id || 'unknown',
      userName: get().currentUser?.name || 'Unknown',
      targetId: userId,
      targetType: 'user',
      description: `Updated role to ${newRole}`,
      timestamp: new Date(),
    });
    get().saveToStorage();
  },

  inviteUser: (email, role) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    const newParticipant: CollaborationUser = {
      id: crypto.randomUUID(),
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email.trim(),
      role: (role || 'therapist') as UserRole,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      isOnline: false,
      lastSeen: new Date(),
    };

    get().addParticipant(newParticipant);
    get().addActivity({
      id: crypto.randomUUID(),
      type: 'user_invited',
      userId: get().currentUser?.id || 'unknown',
      userName: get().currentUser?.name || 'Unknown',
      targetId: newParticipant.id,
      targetType: 'user',
      description: `Invited ${newParticipant.name} as ${role}`,
      timestamp: new Date(),
    });
  },

  inviteToSession: (userId, role) => {
    const session = get().coTherapySession;
    const user = get().participants.find(p => p.id === userId);
    
    if (session && user) {
      const newParticipant: CoTherapySession['participants'][0] = {
        userId: user.id,
        role,
        joinedAt: new Date(),
        permissions: {
          canEditNotes: role === 'lead',
          canControlTimer: role === 'lead',
          canExportData: role !== 'observer',
          canInviteOthers: role === 'lead',
          canEndSession: role === 'lead',
        },
      };

      set({
        coTherapySession: {
          ...session,
          participants: [...session.participants, newParticipant],
          updatedAt: new Date(),
        },
      });

      get().addActivity({
        id: crypto.randomUUID(),
        type: 'session_joined',
        userId: user.id,
        userName: user.name,
        targetId: session.id,
        targetType: 'session',
        description: `Joined co-therapy session as ${role}`,
        timestamp: new Date(),
      });
      get().saveToStorage();
    }
  },

  updateSessionNotes: (_notes) => {
    const session = get().coTherapySession;
    if (session) {
      set({
        coTherapySession: {
          ...session,
          updatedAt: new Date(),
        },
      });
    }
  },

  kickFromSession: (userId) => {
    const session = get().coTherapySession;
    if (session) {
      set({
        coTherapySession: {
          ...session,
          participants: session.participants.filter(p => p.userId !== userId),
          updatedAt: new Date(),
        },
      });

      get().addActivity({
        id: crypto.randomUUID(),
        type: 'session_left',
        userId: userId,
        userName: 'User',
        targetId: session.id,
        targetType: 'session',
        description: 'Left co-therapy session',
        timestamp: new Date(),
      });
      get().saveToStorage();
    }
  },

  addActivity: (activity) => {
    set((state) => ({
      recentActivity: [activity, ...state.recentActivity].slice(0, 50),
    }));
  },

  clearActivity: () => {
    set({ recentActivity: [] });
    get().saveToStorage();
  },


  updateSyncStatus: (status) => {
    set((state) => ({
      syncStatus: { ...state.syncStatus, ...status },
    }));
  },

  incrementPendingChanges: () => {
    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        pendingChanges: state.syncStatus.pendingChanges + 1,
      },
    }));
  },

  decrementPendingChanges: () => {
    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        pendingChanges: Math.max(0, state.syncStatus.pendingChanges - 1),
      },
    }));
  },


  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const dedupById = <T extends { id: string }>(arr?: T[]) => {
          const map = new Map<string, T>();
          (arr || []).forEach((item) => map.set(item.id, item));
          return Array.from(map.values());
        };

        const sharedTemplates = dedupById<SharedTemplate>(parsed.sharedTemplates);
        const workflows = dedupById<WorkflowRequest>(parsed.workflows);

        set({
          currentUser: parsed.currentUser || null,
          coTherapySession: parsed.coTherapySession || null,
          participants: parsed.participants || [],
          presenceData: parsed.presenceData || {},
          sharedTemplates,
          workflows,
          recentActivity: parsed.recentActivity || [],
          isInitialized:
            typeof parsed.isInitialized === 'boolean'
              ? parsed.isInitialized
              : sharedTemplates.length > 0 || workflows.length > 0,
        });
      }
    } catch (error) {
      console.error('Failed to load collaboration state:', error);
    }
  },

  saveToStorage: () => {
    try {
      const state = get();
      const toStore = {
        currentUser: state.currentUser,
        coTherapySession: state.coTherapySession,
        participants: state.participants,
        presenceData: state.presenceData,
        sharedTemplates: state.sharedTemplates,
        workflows: state.workflows,
        recentActivity: state.recentActivity.slice(0, 20),
        isInitialized: state.isInitialized,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save collaboration state:', error);
    }
  },

  reset: () => {
    set({ ...initialState, isInitialized: false });
    localStorage.removeItem(STORAGE_KEY);
  },
}));


if (typeof window !== 'undefined') {
  useCollaborationStore.getState().loadFromStorage();
}


export const useCurrentUser = () => useCollaborationStore((s) => s.currentUser);
export const useCoTherapySession = () => useCollaborationStore((s) => s.coTherapySession);
export const useParticipants = () => useCollaborationStore((s) => s.participants);
export const useSharedTemplates = () => useCollaborationStore((s) => s.sharedTemplates);
export const useWorkflows = () => useCollaborationStore((s) => s.workflows);
export const useUnreadWorkflows = () => useCollaborationStore((s) => s.unreadWorkflows);
export const useRecentActivity = () => useCollaborationStore((s) => s.recentActivity);
export const useSyncStatus = () => useCollaborationStore((s) => s.syncStatus);
