const Reel = require("../models/Reel");
const User = require("../models/User");
const cloudinary = require("cloudinary");

exports.createReel = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.reel, {
      folder: "reels",
    });
    const newReelData = {
      caption: req.body.caption,
      reel: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      owner: req.user._id,
    };

    const reel = await Reel.create(newReelData);

    const user = await User.findById(req.user._id);

    user.reels.unshift(reel._id);

    await user.save();
    res.status(201).json({
      success: true,
      message: "Reel created",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "reel not found",
      });
    }

    if (reel.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await cloudinary.v2.uploader.destroy(reel.video.public_id);

    await reel.remove();

    const user = await User.findById(req.user._id);

    const index = user.reels.indexOf(req.params.id);
    user.reels.splice(index, 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: "reel deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.likeAndUnlikeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "reel not found",
      });
    }

    if (reel.likes.includes(req.user._id)) {
      const index = reel.likes.indexOf(req.user._id);

      reel.likes.splice(index, 1);

      await reel.save();

      return res.status(200).json({
        success: true,
        message: "reel Unliked",
      });
    } else {
      reel.likes.push(req.user._id);

      await reel.save();

      return res.status(200).json({
        success: true,
        message: "Post Liked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getReelOfFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const reels = await Reel.find({
      owner: {
        $in: user.following,
      },
    }).populate("owner likes comments.user");

    res.status(200).json({
      success: true,
      reels: reels.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCaption = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "reel not found",
      });
    }

    if (reel.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    reel.caption = req.body.caption;
    await reel.save();
    res.status(200).json({
      success: true,
      message: "reel updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.commentOnReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "reel not found",
      });
    }

    let commentIndex = -1;

    // Checking if comment already exists

    reel.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      reel.comments[commentIndex].comment = req.body.comment;

      await reel.save();

      return res.status(200).json({
        success: true,
        message: "Comment Updated",
      });
    } else {
      reel.comments.push({
        user: req.user._id,
        comment: req.body.comment,
      });

      await reel.save();
      return res.status(200).json({
        success: true,
        message: "Comment added",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "reel not found",
      });
    }

    // Checking If owner wants to delete

    if (reel.owner.toString() === req.user._id.toString()) {
      if (req.body.commentId === undefined) {
        return res.status(400).json({
          success: false,
          message: "Comment Id is required",
        });
      }

      reel.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return reel.comments.splice(index, 1);
        }
      });

      await reel.save();

      return res.status(200).json({
        success: true,
        message: "Selected Comment has deleted",
      });
    } else {
      reel.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return reel.comments.splice(index, 1);
        }
      });

      await reel.save();

      return res.status(200).json({
        success: true,
        message: "Your Comment has deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
