const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connection-request");
const User = require("../models/user");

const USER_SAFE_DATA = ["firstName", "lastName", " gender", "bio", "skills"];

// Sends or updates a connection request ("interested" or "ignore") to another user.
router.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  const { user } = req;
  try {
    const fromUserId = user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    // Validate the status
    const allowedStatuses = ["interested", "ignore"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status: ${status}`,
      });
    }

    // Check if a connection request already exists
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });

    if (existingRequest) {
      // Prevent redundant actions or conflicting updates
      if (existingRequest.status === status) {
        return res.status(400).json({
          message: `Request already marked as '${status}'.`,
        });
      }
      if (existingRequest.status === "ignore" && status === "interested") {
        return res.status(400).json({
          message: "Cannot send 'interested' request after ignoring.",
        });
      }
      // Update the status if it exists
      existingRequest.status = status;
      const updatedRequest = await existingRequest.save();
      return res.json({
        message: `Request updated to '${status}'.`,
        data: updatedRequest,
      });
    }

    // Create a new connection request
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    res.json({
      message: `${user.firstName} is ${status} to ${toUserId}`,
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error occurred",
      error: error.message,
    });
  }
});

// Allows reviewing and updating a connection request (accept or reject).
router.post("/review/:status/:requestedUserId", userAuth, async (req, res) => {
  const { user } = req;
  try {
    const fromUserId = req.params.requestedUserId;
    const toUserId = user._id;
    const status = req.params.status;

    // Validate the status
    const allowedStatuses = ["accept", "reject"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid review status: ${status}`,
      });
    }

    // Find the "interested" request
    const existingRequest = await ConnectionRequest.findOne({
      fromUserId,
      toUserId,
      status: "interested",
    });

    if (!existingRequest) {
      return res.status(404).json({
        message: "No 'interested' connection request found to review.",
      });
    }

    // Update the status of the request
    existingRequest.status = status;
    const updatedRequest = await existingRequest.save();

    res.json({
      message: `Connection request '${status}ed'.`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error occurred",
      error: error.message,
    });
  }
});

// Fetches incoming "interested" connection requests for review.
router.get("/received", userAuth, async (req, res) => {
  const { user } = req;
  try {
    const connectionRequests = await ConnectionRequest.find({
      toUserId: user._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "Requests received fetched successfully",
      data: connectionRequests,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error occurred",
      error: error.message,
    });
  }
});

// Fetches all accepted connections for the current user.
router.get("/connections", userAuth, async (req, res) => {
  const { user } = req;
  try {
    const loggedInUser = user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: user._id, status: "accept" },
        { fromUserId: user._id, status: "accept" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((request) => {
      if (request.fromUserId.equals(loggedInUser._id)) return request.toUserId;
      return request.fromUserId;
    });

    res.json({
      message: "Connections fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error occurred",
      error: error.message,
    });
  }
});

module.exports = router;
