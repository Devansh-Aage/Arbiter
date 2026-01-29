import { createOrgValidation, getOrgByIdValidation } from "@arbiter/common";
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
    const memberRoot = group.root;

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