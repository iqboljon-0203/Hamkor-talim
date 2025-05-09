import { create } from 'zustand';
import { supabase, Group, GroupMember } from '@/lib/supabase';

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
  ) => Promise<{ success: boolean; error?: any }>;
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
        const { data: memberships, error: membershipError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', userId);

        if (membershipError) throw membershipError;

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

      set({ groups: data, loading: false });
    } catch (error: any) {
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
      // Avval guruh mavjudligini tekshiramiz
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('id', groupId)
        .single();

      if (groupError) throw new Error('Guruh topilmadi');

      // Talaba allaqachon guruhga qo'shilganligini tekshiramiz
      const { data: existingMember, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (existingMember)
        throw new Error("Siz allaqachon bu guruhga qo'shilgansiz");

      // Talabani guruhga qo'shamiz
      const { error } = await supabase
        .from('group_members')
        .insert([{ group_id: groupId, user_id: userId }]);

      if (error) throw error;

      // Guruhlarni yangilaymiz
      await get().fetchGroups(userId, false);

      return { success: true };
    } catch (error: any) {
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
      const { data: memberIds, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (memberError) throw memberError;

      if (memberIds.length === 0) {
        return { members: [] };
      }

      // Get the profile details of all members
      const userIds = memberIds.map((m) => m.user_id);
      const { data: members, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profileError) throw profileError;

      return { members };
    } catch (error: any) {
      return { members: [], error: error.message };
    }
  },
}));
