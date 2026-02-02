import { addMemberValidation, createOrgValidation, OrgIdValidation, getOrgByIdValidation, orgMemberValidation } from "@arbiter/common";
import { prisma } from "@arbiter/db/src/client";
import { Group } from "@semaphore-protocol/group";
import { RequestHandler } from "express";

export const createOrg: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    const validation = createOrgValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { description, name, identityCommitment } = validation.data;

    const group = new Group();
    group.addMember(identityCommitment);
    const memberRoot = group.root.toString();

    const org = await prisma.organization.create({
      data: {
        name,
        description,
        memberRoot,
        context: description,
      },
    });

    await prisma.membership.create({
      data: {
        userId: user.id,
        orgId: org.id,
        identityCommitment,
        leafIndex: 0,
        role: "CREATOR",
      },
    });
    res.status(201).json({ message: "Organization Created" });
  } catch (error) {
    console.error("Error occurred creating an organization", error);
    res
      .status(500)
      .json({ message: "Error occurred creating an organization" });
  }
};

export const getOrgOfUser: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    const orgs = await prisma.organization.findMany({
      where: {
        memberships: {
          some: { userId: user.id },
        },
      },
      include: {
        memberships: true,
        proposals: true,
      }
    });
    if (orgs.length === 0) {
      res.status(404).json({ message: "No organizations found for user" });
      return;
    }
    res.status(200).json({ orgs });
  } catch (error) {
    console.error("Error occurred getting orgs of user", error);
    res
      .status(500)
      .json({ message: "Error occurred getting orgs of user" });
  }
}

export const getOrgById: RequestHandler = async (req, res) => {
  try {
    const validation = getOrgByIdValidation.safeParse(req.params);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { id } = validation.data;
    const org = await prisma.organization.findUnique({
      where: { id: id.toString() },
      include: {
        memberships: true,
        proposals: true,
      }
    });
    if (!org) {
      res.status(404).json({ message: "Organization not found" });
      return;
    }
    res.status(200).json({ org });
  } catch (error) {
    console.error("Error occurred getting org by id", error);
    res
      .status(500)
      .json({ message: "Error occurred getting org by id" });
  }
}

export const getOrgHeaderData: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    const validation = OrgIdValidation.safeParse(req.params);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { orgId } = validation.data;
    const org = await prisma.organization.findUnique({
      where: {
        id: orgId.toString(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        memberships: {
          select: { id: true }
        },
        proposals: {
          select: {
            id: true,
            votes: { select: { id: true } },
            zkVotes: { select: { id: true } },
          }
        }
      }
    });

    if (!org) {
      res.status(404).json({ message: "Organization not found" });
      return;
    }

    const numMemberships = org.memberships.length;
    const numProposals = org.proposals.length;
    const numVotes = org.proposals.reduce(
      (total, p) => total + (p.votes?.length || 0),
      0
    );
    const numZkVotes = org.proposals.reduce(
      (total, p) => total + (p.zkVotes?.length || 0),
      0
    );
    const votes = numVotes + numZkVotes;

    res.status(200).json({
      org: {
        id: org.id,
        name: org.name,
        description: org.description,
        createdAt: org.createdAt,
      },
      numMemberships,
      numProposals,
      numVotes: votes
    });
  } catch (error) {
    console.error("Error occurred getting org header data", error);
    res
      .status(500)
      .json({ message: "Error occurred getting org header data" });
  }
}

export const addMember: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    const validation = addMemberValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { email, orgId } = validation.data;
    const userMembership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        orgId: orgId.toString(),
      },
      select: {
        role: true
      }
    })
    const isAuthorized = userMembership?.role === "CREATOR" || userMembership?.role === "ADMIN";
    if (!isAuthorized) {
      res.status(403).json({ message: "You are not authorized to add members to this organization" });
      return;
    }
    let member = await prisma.user.findUnique({
      where: { email },
    });
    if (!member) {
      member = await prisma.user.create({
        data: {
          email,
        },
      });
    }
    const orgMemberLength = await prisma.membership.count({
      where: {
        orgId: orgId.toString(),
      }
    })
    await prisma.membership.create({
      data: {
        userId: member.id,
        leafIndex: orgMemberLength,
        orgId: orgId.toString(),
      }
    })
    res.status(201).json({ message: "Member added to organization" });
  } catch (error) {
    console.error("Error occurred adding member", error);
    res
      .status(500)
      .json({ message: "Error occurred adding member" });
  }
}

export const removeMember: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    const validation = orgMemberValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { memberId, orgId } = validation.data;
    const userMembership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        orgId: orgId.toString(),
      },
      select: {
        role: true
      }
    })
    const isAuthorized = userMembership?.role === "CREATOR" || userMembership?.role === "ADMIN";
    if (!isAuthorized) {
      res.status(403).json({ message: "You are not authorized to remove members from this organization" });
      return;
    }

    const member = await prisma.membership.findFirst({
      where: {
        userId: memberId.toString(),
        orgId: orgId.toString(),
      }
    })
    if (!member) {
      res.status(404).json({ message: "Member not found in this organization" });
      return;
    }
    await prisma.membership.delete({
      where: {
        id: member.id
      }
    })
    res.status(200).json({ message: "Member removed from organization" });
  } catch (error) {
    console.error("Error occurred removing member", error);
    res
      .status(500)
      .json({ message: "Error occurred removing member" });
  }
}
export const addAdminRole: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    const validation = orgMemberValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { memberId, orgId } = validation.data;
    const userMembership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        orgId: orgId.toString(),
      },
      select: {
        role: true
      }
    })
    const isAuthorized = userMembership?.role === "CREATOR" || userMembership?.role === "ADMIN";
    if (!isAuthorized) {
      res.status(403).json({ message: "You are not authorized to add admin roles to this organization" });
      return;
    }

    const member = await prisma.membership.findFirst({
      where: {
        userId: memberId.toString(),
        orgId: orgId.toString(),
      }
    })
    if (!member) {
      res.status(404).json({ message: "Member not found in this organization" });
      return;
    }

    const isPrivileged = member.role === "CREATOR" || member.role === "ADMIN";
    if (isPrivileged) {
      res.status(403).json({ message: "Member is already a privileged user" });
      return;
    }

    await prisma.membership.update({
      where: { id: member.id },
      data: { role: "ADMIN" }
    })
    res.status(200).json({ message: "Admin role added to member" });
  } catch (error) {
    console.error("Error occurred adding admin role", error);
    res
      .status(500)
      .json({ message: "Error occurred adding admin role" });
  }
}


export const removeAdminRole: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    const validation = orgMemberValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { memberId, orgId } = validation.data;
    const userMembership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        orgId: orgId.toString(),
      },
      select: {
        role: true
      }
    })
    const isAuthorized = userMembership?.role === "CREATOR" || userMembership?.role === "ADMIN";
    if (!isAuthorized) {
      res.status(403).json({ message: "You are not authorized to remove admin roles from this organization" });
      return;
    }

    const member = await prisma.membership.findFirst({
      where: {
        userId: memberId.toString(),
        orgId: orgId.toString(),
      }
    })
    if (!member) {
      res.status(404).json({ message: "Member not found in this organization" });
      return;
    }

    const isCreator = member.role === "CREATOR";
    if (isCreator) {
      res.status(403).json({ message: "You cannot demote the creator of the organization" });
      return;
    }

    const isNotAdmin = member.role !== "ADMIN";
    if (isNotAdmin) {
      res.status(403).json({ message: "Member is not an admin" });
      return;
    }

    await prisma.membership.update({
      where: { id: member.id },
      data: { role: "MEMBER" }
    })
    res.status(200).json({ message: "Admin role removed from member" });
  } catch (error) {
    console.error("Error occurred removing admin role", error);
    res
      .status(500)
      .json({ message: "Error occurred removing admin role" });
  }
}

export const deleteOrg: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: "User not found!" });
      return;
    }
    const validation = OrgIdValidation.safeParse(req.params);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error,
      });
      return;
    }
    const { orgId } = validation.data;
    const userMembership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        orgId: orgId.toString(),
      },
      select: {
        role: true
      }
    })
    const isAuthorized = userMembership?.role === "CREATOR"
    if (!isAuthorized) {
      res.status(403).json({ message: "You are not authorized to delete this organization" });
      return;
    }
    await prisma.organization.delete({
      where: { id: orgId.toString() }
    })
    res.status(200).json({ message: "Organization deleted" });
  } catch (error) {
    console.error("Error occurred deleting organization", error);
    res
      .status(500)
      .json({ message: "Error occurred deleting organization" });
  }
}