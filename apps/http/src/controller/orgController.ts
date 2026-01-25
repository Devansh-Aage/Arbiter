import { createOrgValidation } from "@arbiter/common";
import { prisma } from "@arbiter/db";
import { Group } from "@semaphore-protocol/group";
import { RequestHandler } from "express";

export const createOrg: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
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
        userId,
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
