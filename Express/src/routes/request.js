const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connection-request");
const User = require("../models/user");
const mongoose = require("mongoose");

const USER_SAFE_DATA = ["firstName", "lastName", "gender", "bio", "skills"];
const ALLOWED_STATUSES = ["interested", "ignore"];
const REVIEW_STATUSES = ["accept", "reject"];

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Sends or updates a connection request
router.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  const { user } = req;
  const fromUserId = user._id;
  const { status, toUserId } = req.params;

  try {
    // Validate ObjectId
    if (!isValidObjectId(toUserId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Validate status
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status: '${status}'. Allowed statuses are: ${ALLOWED_STATUSES.join(
          ", "
        )}.`,
      });
    }

    // Check existing connection request
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
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
      // Update existing request
      existingRequest.status = status;
      const updatedRequest = await existingRequest.save();
      return res.json({
        message: `Request status updated to '${status}'.`,
        data: updatedRequest,
      });
    }

    // Fetch the toUser details
    const toUser = await User.findById(toUserId, "firstName");
    if (!toUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create new connection request
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();
    res.json({
      message: `${user.firstName} is ${status} to ${toUser.firstName}`,
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

// Allows reviewing and updating a connection request
router.post("/review/:status/:requestedUserId", userAuth, async (req, res) => {
  const { user } = req;
  const { status, requestedUserId } = req.params;

  try {
    // Validate ObjectId
    if (!isValidObjectId(requestedUserId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Validate status
    if (!REVIEW_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ message: `Invalid review status: ${status}` });
    }

    const fromUserId = requestedUserId;
    const toUserId = user._id;

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

    existingRequest.status = status;
    const updatedRequest = await existingRequest.save();

    res.json({
      message: `Connection request '${status}ed'.`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

// Fetch incoming "interested" connection requests for review
router.get("/received/incoming", userAuth, async (req, res) => {
  const { user } = req;
  try {
    const connectionRequests = await ConnectionRequest.find({
      toUserId: user._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "Incoming connection requests fetched successfully",
      data: connectionRequests,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

// Fetch outgoing "interested" connection requests for review
router.get("/received/outgoing", userAuth, async (req, res) => {
  const { user } = req;
  try {
    const connectionRequests = await ConnectionRequest.find({
      fromUserId: user._id,
      status: "interested",
    }).populate("toUserId", USER_SAFE_DATA);

    res.json({
      message: "Outgoing connection requests fetched successfully",
      data: connectionRequests,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

// Fetches all accepted connections for the current user
router.get("/connections", userAuth, async (req, res) => {
  const { user } = req;
  try {
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: user._id, status: "accept" },
        { fromUserId: user._id, status: "accept" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((request) =>
      request.fromUserId.equals(user._id)
        ? request.toUserId
        : request.fromUserId
    );

    res.json({ message: "Connections fetched successfully", data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

// Fetches the feed of users
router.get("/feed", userAuth, async (req, res) => {
  const page = parseInt(req.query.page || 1, 10);
  const limit = Math.min(parseInt(req.query.limit || 10, 10), 50);
  const skip = (page - 1) * limit;

  const { user } = req;
  try {
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }],
    });

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((request) => {
      hideUsersFromFeed.add(String(request.fromUserId));
      hideUsersFromFeed.add(String(request.toUserId));
    });

    const users = await User.find({
      _id: { $nin: Array.from(hideUsersFromFeed) },
      _id: { $ne: user._id },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ message: "Feed fetched", users });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

module.exports = router;
