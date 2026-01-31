import { create } from 'zustand';
import { supabase, Group, GroupMember } from '@/lib/supabase';
import { useTaskStore } from '@/hooks/useTaskStore';

interface GroupState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  fetchGroups: (userId: string, isTeacher: boolean) => Promise<void>;
  createGroup: (
    name: string,
    description: string,
    createdBy: string,
  ) => Promise<{ success: boolean; error?: any; groupId?: string }>;
  addStudentToGroup: (
    groupId: string,
    email: string,
  ) => Promise<{ success: boolean; error?: any }>;
  joinGroup: (
    groupId: string,
    userId: string,
  ) => Promise<{ success: boolean; error?: any; group?: Group }>;
  leaveGroup: (
    groupId: string,
    userId: string,
  ) => Promise<{ success: boolean; error?: any }>;
  getGroupMembers: (
    groupId: string,
  ) => Promise<{ members: any[]; error?: any }>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  loading: false,
  error: null,

  fetchGroups: async (userId, isTeacher) => {
    console.log('[GroupStore] fetchGroups start', { userId, isTeacher });
    set({ loading: true, error: null });
    try {
      let data = [];

      if (isTeacher) {
        // Fetch groups created by the teacher
        const { data: teacherGroups, error } = await supabase
          .from('groups')
          .select('*')
          .eq('created_by', userId);

        if (error) throw error;
        data = teacherGroups;
      } else {
        // Fetch groups the student is a member of
        let memberships: any[] = [];
        try {
          const { data: membershipData, error: membershipError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', userId);

          if (membershipError) {
            // RLS recursion xatosini handle qilamiz
            if (membershipError.code === '42P17') {
              console.warn('[GroupStore] RLS recursion detected, using empty memberships');
              memberships = [];
            } else {
              throw membershipError;
            }
          } else {
            memberships = membershipData || [];
          }
        } catch (membershipError: any) {
          if (membershipError.code === '42P17') {
            console.warn('[GroupStore] RLS recursion in fetchGroups, continuing with empty list');
            memberships = [];
          } else {
            throw membershipError;
          }
        }

        // Get the group details
        if (memberships.length > 0) {
          const groupIds = memberships.map((m) => m.group_id);
          const { data: studentGroups, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .in('id', groupIds);

          if (groupError) throw groupError;
          data = studentGroups;
        }
      }

      console.log('[GroupStore] fetchGroups success', {
        count: data.length,
      });
      set({ groups: data, loading: false });
      const allowedGroupIds = (data || []).map((group: Group) => group.id);
      useTaskStore.getState().restrictTasksToGroups(allowedGroupIds);
    } catch (error: any) {
      console.error('[GroupStore] fetchGroups error', error);
      set({ error: error.message, loading: false });
    }
  },

  createGroup: async (name, description, createdBy) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{ name, description, created_by: createdBy }])
        .select();

      if (error) throw error;

      // Add the new group to the store
      const { groups } = get();
      set({ groups: [...groups, data[0]] });

      return { success: true, groupId: data[0].id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  addStudentToGroup: async (groupId, email) => {
    try {
      // First, find the user with the given email
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .eq('role', 'student')
        .single();

      if (userError) throw new Error('Student not found with that email');

      // Then add the student to the group
      const { error } = await supabase
        .from('group_members')
        .insert([{ group_id: groupId, user_id: users.id }]);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  joinGroup: async (groupId, userId) => {
    try {
      console.log('[GroupStore] joinGroup start', { groupId, userId });
      const trimmedGroupId = groupId.trim();
      if (!trimmedGroupId) {
        throw new Error('Guruh ID kiritilmadi');
      }

      // Talaba allaqachon guruhga qo'shilganligini tekshiramiz
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', trimmedGroupId)
        .maybeSingle();

      if (groupError && groupError.code !== 'PGRST116') {
        console.error('[GroupStore] joinGroup group lookup error', groupError);
        throw groupError;
      }
      if (!groupData) {
        throw new Error('Guruh topilmadi');
      }

      // RLS recursion xatosini oldini olish uchun
      // Avval tekshirishni skip qilamiz va to'g'ridan-to'g'ri insert qilamiz
      let existingMembers: any[] = [];
      try {
        const { data: members, error: memberError } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', trimmedGroupId)
          .eq('user_id', userId);

        if (memberError && memberError.code !== '42P17') {
          // RLS recursion xatosi bo'lmasa, xatoni throw qilamiz
          console.error('[GroupStore] joinGroup member check error', memberError);
          throw memberError;
        }
        
        // RLS recursion xatosi bo'lsa, existingMembers bo'sh qoladi
        if (members) {
          existingMembers = members;
        }
      } catch (checkError: any) {
        // RLS recursion xatosi bo'lsa, davom etamiz
        if (checkError.code !== '42P17') {
          throw checkError;
        }
        console.warn('[GroupStore] RLS recursion detected during member check, continuing...');
      }

      if (existingMembers && existingMembers.length > 0) {
        throw new Error("Siz allaqachon bu guruhga qo'shilgansiz");
      }

      // Talabani guruhga qo'shamiz
      const { error } = await supabase
        .from('group_members')
        .insert([{ group_id: trimmedGroupId, user_id: userId }]);

      if (error) {
        console.error('[GroupStore] joinGroup insert error', error);
        
        // RLS recursion xatosini handle qilamiz
        if (error.code === '42P17') {
          return {
            success: false,
            error: 'RLS policy xatosi. Iltimos, Supabase dashboard\'da group_members jadvali uchun policy\'larni tekshiring.',
          };
        }
        
        if (error.code === '23503' || error.message?.includes('foreign key')) {
          throw new Error('Guruh topilmadi');
        }
        
        // Unique constraint xatosi (allaqachon qo'shilgan)
        if (error.code === '23505') {
          throw new Error("Siz allaqachon bu guruhga qo'shilgansiz");
        }
        
        throw error;
      }

      // Guruhlarni yangilaymiz
      await get().fetchGroups(userId, false);
      await useTaskStore.getState().fetchTasks(trimmedGroupId);

      console.log('[GroupStore] joinGroup success', { groupId: trimmedGroupId });
      return { success: true, group: groupData as Group };
    } catch (error: any) {
      console.error('[GroupStore] joinGroup error', error);
      return { success: false, error: error.message };
    }
  },

  leaveGroup: async (groupId, userId) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh the groups
      await get().fetchGroups(userId, false);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getGroupMembers: async (groupId) => {
    try {
      let memberIds: any[] = [];
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (memberError) {
        // RLS recursion xatosini handle qilamiz
        if (memberError.code === '42P17') {
          console.warn('[GroupStore] RLS recursion in getGroupMembers');
          return { members: [], error: 'RLS policy xatosi' };
        }
        throw memberError;
      }

      memberIds = memberData || [];

      if (memberIds.length === 0) {
        return { members: [] };
      }

      // Get the profile details of all members
      const userIds = memberIds.map((m) => m.user_id);
      const { data: members, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profileError) {
        // RLS recursion xatosini handle qilamiz
        if (profileError.code === '42P17') {
          console.warn('[GroupStore] RLS recursion in profiles query');
          return { members: [] };
        }
        throw profileError;
      }

      return { members: members || [] };
    } catch (error: any) {
      return { members: [], error: error.message };
    }
  },
}));
