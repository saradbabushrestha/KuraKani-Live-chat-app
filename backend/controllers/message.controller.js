import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Ensure IDs are valid ObjectIds and remove any extra spaces/newlines
    const senderObjectId = new mongoose.Types.ObjectId(
      senderId.toString().trim()
    );
    const receiverObjectId = new mongoose.Types.ObjectId(
      receiverId.toString().trim()
    );

    // Find or create conversation between the participants
    let conversation = await Conversation.findOne({
      participants: { $all: [senderObjectId, receiverObjectId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderObjectId, receiverObjectId],
      });
    }

    // Create the message
    const newMessage = new Message({
      senderId: senderObjectId,
      receiverId: receiverObjectId,
      message: message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    // Save both the conversation and the new message in parallel
    await Promise.all([conversation.save(), newMessage.save()]);
    //Socket IO FUNCTIONALITY WILL GO HERE

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // io.to(<socket_id>).emit() used to send events to specific client
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    // Ensure both senderId and userToChatId are valid ObjectIds
    const senderObjectId = new mongoose.Types.ObjectId(
      senderId.toString().trim()
    );
    const userToChatObjectId = new mongoose.Types.ObjectId(
      userToChatId.toString().trim()
    );

    // Find the conversation and populate its messages
    const conversation = await Conversation.findOne({
      participants: { $all: [senderObjectId, userToChatObjectId] },
    }).populate("messages"); //Not reference but actual messages

    if (!conversation) {
      return res.status(200).json({ error: "Conversation not found" });
    }

    // Respond with the conversation messages
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
