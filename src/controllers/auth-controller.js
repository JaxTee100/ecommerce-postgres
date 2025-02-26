const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const prisma = new PrismaClient();


const createUser =  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    try {
      // Ensure role is valid
      const validRoles = ['USER', 'ADMIN'];
      if (!validRoles.includes(role)) {
          return res.status(400).json({ message: 'Invalid role. Use USER or ADMIN.' });
      }


      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ message: "User already exists" });

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
      });


      res.status(201).json({
        message: "User created successfully",
        data: newUser
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

const loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      // Generate JWT token
      const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      res.json({ token });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

  module.exports = {
    createUser,
    loginUser
  }