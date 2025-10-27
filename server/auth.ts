import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendPasswordResetEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET;
  
  if (!sessionSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is required in production");
    }
    console.warn("⚠️  SESSION_SECRET not set, using development fallback. This is insecure for production!");
  }

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site in production (for mobile apps)
      domain: undefined, // Allow any domain (important for different network configurations)
    },
    name: 'orephia.sid', // Custom session name
    rolling: true, // Extend session on each request
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const existingEmail = await storage.getUserByEmail(req.body.email);
    if (existingEmail) {
      return res.status(400).send("Email already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Password reset endpoints
  app.post("/api/password-reset/request", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      // For security, always return success even if user doesn't exist
      if (!user) {
        return res.status(200).json({ message: "If an account exists, a password reset email has been sent." });
      }

      // Generate secure random token
      const resetToken = randomBytes(32).toString("hex");
      
      // Token expires in 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Store token in database
      await storage.createPasswordResetToken({
        token: resetToken,
        userId: user.id,
        expiresAt,
      });

      // Send email
      try {
        await sendPasswordResetEmail(user.email, resetToken, user.username);
        console.log(`✅ Password reset email sent to ${user.email}`);
      } catch (emailError: any) {
        console.error("❌ Failed to send password reset email:", emailError?.message || emailError);
        
        // Log specific Resend errors
        if (emailError?.message?.includes('Resend')) {
          console.error("⚠️  Resend Configuration Issue:");
          console.error("   1. Check if your Resend account is verified");
          console.error("   2. Verify the 'from' email address in Resend dashboard");
          console.error("   3. Check if you're in sandbox mode (can only send to verified emails)");
        }
        
        // Still return success to user for security
      }

      res.status(200).json({ message: "If an account exists, a password reset email has been sent." });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  app.post("/api/password-reset/verify", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      if (new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ error: "Reset token has expired" });
      }

      res.status(200).json({ valid: true });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ error: "Failed to verify token" });
    }
  });

  app.post("/api/password-reset/reset", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      if (new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ error: "Reset token has expired" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user's password
      await storage.updateUserPassword(resetToken.userId, hashedPassword);

      // Delete the used token
      await storage.deletePasswordResetToken(token);

      res.status(200).json({ message: "Password successfully reset" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
}
