// src/infrastructure/repository/team_repo.js

import { TeamModel } from "../model/team_model.js";
import { TeamLeaveRequestModel } from "../model/team_leave_request_model.js";
import { Team } from "../../domain/entities/team.entity.js";

const mapDocToTeam = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id ? String(obj._id) : obj.id;
  obj.members = (obj.members || []).map((m) => String(m));
  obj.managerId = obj.managerId ? String(obj.managerId) : obj.managerId;
  delete obj._id;
  return new Team(obj);
};

export const teamRepository = {
  // -----------------------
  // TEAM CRUD + MEMBERS
  // -----------------------

  create: async (teamEntity) => {
    const teamDoc = new TeamModel(teamEntity);
    const saved = await teamDoc.save();
    return mapDocToTeam(saved);
  },

  findById: async (id) => {
    const teamDoc = await TeamModel.findById(id);
    return mapDocToTeam(teamDoc);
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
    return mapDocToTeam(saved);
  },

  findByManager: async (managerId) => {
    const teams = await TeamModel.find({ managerId });
    return teams.map(mapDocToTeam);
  },

  findByManagerAndName: async (managerId, name) => {
    const teamDoc = await TeamModel.findOne({ managerId, name });
    return teamDoc ? mapDocToTeam(teamDoc) : null;
  },

  findByMember: async (userId) => {
    const teams = await TeamModel.find({ members: userId });
    return teams.map(mapDocToTeam);
  },

  // -----------------------------------------------------
  //             LEAVE REQUEST SYSTEM (NEW)
  // -----------------------------------------------------

  // 1️⃣ Member requests to leave
  requestLeave: async (teamId, userId) => {
    // Check if pending request already exists
    const existing = await TeamLeaveRequestModel.findOne({
      teamId,
      userId,
      status: "pending",
    });

    if (existing) {
      return existing; // return existing pending request
    }

    const req = new TeamLeaveRequestModel({
      teamId,
      userId,
      status: "pending",
    });

    return await req.save();
  },

  // 2️⃣ Manager gets all leave requests for their team
  getLeaveRequests: async (teamId) => {
    return await TeamLeaveRequestModel.find({ teamId }).sort({ createdAt: -1 });
  },
  getLeaveRequestById: async (id) => {
  return await TeamLeaveRequestModel.findById(id);
},


  // 3️⃣ Approve leave request → remove member from team
  approveLeave: async (requestId) => {
    const req = await TeamLeaveRequestModel.findById(requestId);
    if (!req) throw new Error("Leave request not found");

    req.status = "approved";
    await req.save();

    // Remove user from team
    const team = await TeamModel.findById(req.teamId);
    if (!team) throw new Error("Team not found");

    team.members = (team.members || []).filter(
      (m) => String(m) !== String(req.userId)
    );
    await team.save();

    return req;
  },

  // 4️⃣ Reject leave request
  rejectLeave: async (requestId) => {
    const req = await TeamLeaveRequestModel.findById(requestId);
    if (!req) throw new Error("Leave request not found");

    req.status = "rejected";
    await req.save();

    return req;
  },
};
