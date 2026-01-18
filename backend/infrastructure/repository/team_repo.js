import mongoose from "mongoose";
import { TeamModel } from "../model/team_model.js";
import { TeamLeaveRequestModel } from "../model/team_leave_request_model.js";
import { TaskModel } from "../model/task_model.js";
import { Team } from "../../domain/entities/team.entity.js";

// Map MongoDB document to Team entity
const mapDocToTeam = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id ? String(obj._id) : obj.id;

  // 🔹 Team profile fields
  obj.bio = obj.bio || "";
  obj.profilePicture = obj.profilePicture || null;

  // Handle populated members
  obj.members = (obj.members || []).map((m) => {
    if (m && typeof m === "object" && m._id) {
      return {
        id: String(m._id),
        username: m.username,
        name: m.name,
        profilePicture: m.profilePicture
      };
    }
    return String(m);
  });

  // Handle populated manager
  if (obj.managerId && typeof obj.managerId === "object" && obj.managerId._id) {
    obj.managerId = {
      id: String(obj.managerId._id),
      username: obj.managerId.username,
      name: obj.managerId.name
    };
  } else {
    obj.managerId = obj.managerId ? String(obj.managerId) : obj.managerId;
  }

  delete obj._id;
  return new Team(obj);
};

export const teamRepository = {
  // -----------------------
  // TEAM CRUD + MEMBERS
  // -----------------------

  create: async (teamEntity) => {
    const teamDoc = new TeamModel({
      name: teamEntity.name,
      managerId: teamEntity.managerId,
      members: teamEntity.members || [],
      bio: teamEntity.bio || "",
      profilePicture: teamEntity.profilePicture || null,
      createdAt: teamEntity.createdAt
    });
    const saved = await teamDoc.save();
    return mapDocToTeam(saved);
  },

  findById: async (id) => {
    const teamDoc = await TeamModel.findById(id)
      .populate("members", "username name profilePicture")
      .populate("managerId", "username name");
    return mapDocToTeam(teamDoc);
  },

  update: async (id, updateData) => {
    const updated = await TeamModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("members", "username name profilePicture")
      .populate("managerId", "username name");

    return mapDocToTeam(updated);
  },

  addMember: async (teamId, userId) => {
    const team = await TeamModel.findById(teamId);
    if (!team) throw new Error("Team not found");

    const already = (team.members || []).some(
      (m) => String(m) === String(userId)
    );

    if (!already) {
      team.members.push(userId);
    }

    const saved = await team.save();
    return mapDocToTeam(saved);
  },

  removeMember: async (teamId, userId) => {
    const team = await TeamModel.findById(teamId);
    if (!team) throw new Error("Team not found");

    team.members = (team.members || []).filter(
      (m) => String(m) !== String(userId)
    );

    const saved = await team.save();

    // 🔹 Remove teamId from tasks assigned to this user in this team
    await TaskModel.updateMany({ teamId, userId }, { teamId: null });

    return mapDocToTeam(saved);
  },

  findByManager: async (managerId) => {
    const teams = await TeamModel.find({ managerId })
      .populate("members", "username name profilePicture")
      .populate("managerId", "username name");
    return teams.map(mapDocToTeam);
  },

  findByManagerAndName: async (managerId, name) => {
    const teamDoc = await TeamModel.findOne({ managerId, name });
    return teamDoc ? mapDocToTeam(teamDoc) : null;
  },

  findByMember: async (userId) => {
    const teams = await TeamModel.find({ members: userId })
      .populate("members", "username name profilePicture")
      .populate("managerId", "username name");
    return teams.map(mapDocToTeam);
  },

  // -----------------------
  // LEAVE REQUEST SYSTEM
  // -----------------------

  requestLeave: async (teamId, userId) => {
    const existing = await TeamLeaveRequestModel.findOne({
      teamId,
      userId,
      status: "pending"
    });

    if (existing) return existing;

    const req = new TeamLeaveRequestModel({
      teamId,
      userId,
      status: "pending"
    });

    return await req.save();
  },

  getLeaveRequests: async (teamId, status = "pending") => {
    const filter = { teamId };
    if (status && status !== "all") {
      filter.status = status;
    }
    return await TeamLeaveRequestModel.find(filter)
      .populate('userId', 'username name')
      .sort({ createdAt: -1 });
  },

  getLeaveRequestById: async (id) => {
    return await TeamLeaveRequestModel.findById(id);
  },

  approveLeave: async (requestId) => {
    const req = await TeamLeaveRequestModel.findById(requestId);
    if (!req) throw new Error("Leave request not found");

    req.status = "approved";
    await req.save();

    const team = await TeamModel.findById(req.teamId);
    if (!team) throw new Error("Team not found");

    team.members = (team.members || []).filter(
      (m) => String(m) !== String(req.userId)
    );
    await team.save();

    // 🔹 Remove teamId from tasks assigned to this user in this team
    await TaskModel.updateMany({ teamId: req.teamId, userId: req.userId }, { teamId: null });

    return req;
  },

  rejectLeave: async (requestId) => {
    const req = await TeamLeaveRequestModel.findById(requestId);
    if (!req) throw new Error("Leave request not found");

    req.status = "rejected";
    await req.save();
    return req;
  },

  delete: async (id) => {
    await TeamLeaveRequestModel.deleteMany({ teamId: id });
    await TaskModel.deleteMany({ teamId: id });
    return await TeamModel.findByIdAndDelete(id);
  },

  getManagerStats: async (managerId) => {
    const teams = await TeamModel.find({ managerId });
    const totalMembers = teams.reduce((acc, team) => acc + (team.members?.length || 0), 0);
    return {
      managedTeamsCount: teams.length,
      totalMembers
    };
  }
};
