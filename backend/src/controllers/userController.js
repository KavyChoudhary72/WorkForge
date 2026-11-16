import User from '../models/User.js';
import { isCloudinaryConfigured, uploadBase64ToCloudinary } from '../config/cloudinary.js';

export const getUsers = async (req, res, next) => {
  try {
    const filter = req.user.role === 'SUPER_ADMIN' ? {} : { organizationId: req.user.organizationId };
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.designation = req.body.designation !== undefined ? req.body.designation : user.designation;
      user.department = req.body.department !== undefined ? req.body.department : user.department;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      
      if (Array.isArray(req.body.skills)) {
        user.skills = req.body.skills.filter(s => typeof s === 'string' && s.trim().length > 0);
      }
      
      if (req.body.profileImage) {
        if (req.body.profileImage.startsWith('data:image') && isCloudinaryConfigured()) {
          try {
            const cldRes = await uploadBase64ToCloudinary(req.body.profileImage, `workforge/avatars/${user._id}`);
            user.profileImage = cldRes.url;
            user.avatar = cldRes.url;
          } catch (cldErr) {
            console.warn('[Cloudinary] Avatar upload fallback to base64:', cldErr.message);
            user.profileImage = req.body.profileImage;
            user.avatar = req.body.profileImage;
          }
        } else {
          user.profileImage = req.body.profileImage;
          user.avatar = req.body.profileImage;
        }
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        id: updatedUser._id,
        userId: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        designation: updatedUser.designation,
        phone: updatedUser.phone,
        skills: updatedUser.skills || [],
        avatar: updatedUser.avatar || updatedUser.profileImage,
        profileImage: updatedUser.profileImage || updatedUser.avatar
      });
    } else {
      res.status(404).json({ message: 'User account not found.' });
    }
  } catch (error) {
    next(error);
  }
};
