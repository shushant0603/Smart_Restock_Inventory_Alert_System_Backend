import prisma from '../config/prisma.js';

// Create a new Planning Request
export const createPlanningRequest = async (req, res) => {
  try {
    const { type, from, to, product, qty, requiredDate, priority, status } = req.body;

    const newRequest = await prisma.planningRequest.create({
      data: {
        requestId: `PR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        type,
        from,
        to,
        product,
        qty,
        requiredDate,
        priority,
        status: status || "New",
        userId: req.user ? req.user.id : null,
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating planning request:", error);
    res.status(500).json({ error: "Failed to create planning request" });
  }
};

// Get all Planning Requests
export const getPlanningRequests = async (req, res) => {
  try {
    const requests = await prisma.planningRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching planning requests:", error);
    res.status(500).json({ error: "Failed to fetch planning requests" });
  }
};

// Update Planning Request Status (Accept or Reject)
export const updatePlanningRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const updatedRequest = await prisma.planningRequest.update({
      where: { id },
      data: {
        status,
        ...(reason && { reason }), // Only update reason if provided
      },
    });

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error updating planning request:", error);
    res.status(500).json({ error: "Failed to update planning request" });
  }
};
